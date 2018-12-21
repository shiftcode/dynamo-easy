import { ExpressionAttributeNameMap, ExpressionAttributeValueMap, UpdateItemInput } from 'aws-sdk/clients/dynamodb'
import { isEmpty, isString } from 'lodash'
import { ConditionalParams } from '../operation-params.type'
import { resolveAttributeValueNameConflicts } from './functions/resolve-attribute-value-name-conflicts.function'
import { Expression } from './type'
import { UpdateActionKeyword } from './type/update-action-keyword.type'

export function addUpdateExpression(updateExpression: Expression, params: UpdateItemInput): void {
  addExpression('UpdateExpression', updateExpression, params)
}

export function addExpression(
  expressionType: 'ConditionExpression' | 'KeyConditionExpression' | 'FilterExpression' | 'UpdateExpression',
  condition: Expression,
  params: ConditionalParams,
) {
  const nameSafeCondition = resolveAttributeValueNameConflicts(condition, params)

  const expressionAttributeNames = <ExpressionAttributeNameMap>{
    ...params.ExpressionAttributeNames,
    ...nameSafeCondition.attributeNames,
  }

  const expressionAttributeValues = <ExpressionAttributeValueMap>{
    ...params.ExpressionAttributeValues,
    ...nameSafeCondition.attributeValues,
  }

  if (!isEmpty(expressionAttributeNames)) {
    params.ExpressionAttributeNames = expressionAttributeNames
  }

  if (!isEmpty(expressionAttributeValues)) {
    params.ExpressionAttributeValues = expressionAttributeValues
  }

  const statement = params[expressionType]
  if (isString(statement) && statement !== '') {
    switch (expressionType) {
      case 'UpdateExpression':
        ;(<any>params)[expressionType] = mergeUpdateExpressions(statement, nameSafeCondition.statement)
        break
      default:
        ;(<any>params)[expressionType] = `${statement} AND ${nameSafeCondition.statement}`
    }
  } else {
    ;(<any>params)[expressionType] = nameSafeCondition.statement
  }
}

type UpdateExpressionsByKeyword = Record<UpdateActionKeyword, string>


/**
 * Will merge two update expressions into one, one action keyword can only appear once in an update expression
 *
 * ```
 * const merged = mergeUpdateExpressions(
 *                    'SET a, b REMOVE e, f ADD i, j DELETE m, n',
 *                    'SET c, d REMOVE g, h ADD k, l DELETE o, p',
 *                )
 * console.log(merged) -> 'SET a, b, c, d REMOVE e, f, g, h ADD i, j, k, l DELETE m, n, o, p'
 * ```
 *
 * @param expression1
 * @param expression2
 */
export function mergeUpdateExpressions(expression1: string, expression2: string): string {
  const a = splitUpdateExpressionToActionKeyword(expression1)
  const b = splitUpdateExpressionToActionKeyword(expression2)
  return Array.from(new Set(<UpdateActionKeyword[]>[...Object.keys(a), ... Object.keys(b)]))
    .map(clause => `${clause} ` + (!a[clause] ? b[clause] : !b[clause] ? a[clause] : `${a[clause]}, ${b[clause]}`))
    .join(' ')
}

/**
 * Will return an object containing all the update statements mapped to an update action keyword
 */
function splitUpdateExpressionToActionKeyword(updateExpression: string): UpdateExpressionsByKeyword {
  // add a whitespace at the beginning of the expression to be able to work with a more stricter regex
  return ` ${updateExpression}`
  // the regex ensures a whitespace at the beginning of the ActionWord
  // -> to not have problems with properties named exactly as an ActionKeyword
    .split(/\s(SET|REMOVE|ADD|DELETE)\s/g)
    .reduce((u, e, i, arr) => {
      if (isUpdateActionKeyword(e)) {
        u[e] = arr[i + 1]
      } else {
        throw new Error(`unknown action keyword ${e}`)
      }

      return u
    }, <UpdateExpressionsByKeyword>{})
}

function isUpdateActionKeyword(val: string): val is UpdateActionKeyword {
  return /^(SET|REMOVE|ADD|DELETE)$/.test(val)
}
