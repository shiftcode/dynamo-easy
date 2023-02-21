/**
 * @module expression
 */
import * as DynamoDB from '@aws-sdk/client-dynamodb'
import { Metadata } from '../../decorator/metadata/metadata'
import { Attributes } from '../../mapper/type/attribute.type'
import { addUpdateExpression } from './param-util'
import { Expression } from './type/expression.type'
import { UpdateActionKeyword } from './type/update-action-keyword.type'
import { UpdateExpressionDefinitionFunction } from './type/update-expression-definition-function'
import { UpdateExpression } from './type/update-expression.type'

/**
 * @hidden
 */
export function prepareAndAddUpdateExpressions(
  metadata: Metadata<any>,
  params: DynamoDB.UpdateItemInput | DynamoDB.Update,
  updateDefFns: UpdateExpressionDefinitionFunction[],
) {
  if (updateDefFns && updateDefFns.length) {
    const sortedByActionKeyWord: Map<UpdateActionKeyword, UpdateExpression[]> = updateDefFns
      .map((updateDefFn) => {
        // TODO v3: investigate on how to remove any
        // tslint:disable-next-line:no-unnecessary-type-assertion
        return updateDefFn(params.ExpressionAttributeNames as any, metadata)
      })
      .reduce((result, expr) => {
        const actionKeyword = expr.type
        if (!result.has(actionKeyword)) {
          result.set(actionKeyword, [])
        }

        result.get(actionKeyword).push(expr)
        return result
      }, new Map())

    const actionStatements: string[] = []
    let attributeValues: Attributes = {}
    let attributeNames: Record<string, string> = {}

    for (const [actionKeyword, updateExpressions] of sortedByActionKeyWord) {
      const statements: string[] = []
      if (updateExpressions && updateExpressions.length) {
        updateExpressions.forEach((updateExpression) => {
          statements.push(updateExpression.statement)
          attributeValues = { ...attributeValues, ...updateExpression.attributeValues }
          attributeNames = { ...attributeNames, ...updateExpression.attributeNames }
        })
        actionStatements.push(`${actionKeyword} ${statements.join(', ')}`)
      }
    }

    const expression: Expression = {
      statement: actionStatements.join(' '),
      attributeValues,
      attributeNames,
    }

    addUpdateExpression(expression, params)
  } else {
    throw new Error('at least one update operation must be defined')
  }
}
