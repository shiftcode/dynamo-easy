import {
  ExpressionAttributeNameMap,
  ExpressionAttributeValueMap,
  QueryInput,
  ScanInput,
  UpdateItemInput,
} from 'aws-sdk/clients/dynamodb'
import { isEmpty, isString } from 'lodash'
import { resolveAttributeValueNameConflicts } from './functions/resolve-attribute-value-name-conflicts.function'
import { Expression } from './type'

export function addUpdateExpression(updateExpression: Expression, params: UpdateItemInput) {
  addExpression('UpdateExpression', updateExpression, params)
}

export function addExpression(
  expressionType: 'ConditionExpression' | 'KeyConditionExpression' | 'FilterExpression' | 'UpdateExpression',
  condition: Expression,
  params: QueryInput | ScanInput | UpdateItemInput,
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

  const expression = Reflect.get(params, expressionType)
  if (isString(expression)) {
    switch (expressionType) {
      case 'UpdateExpression':
        if (expression !== '') {
          throw new Error(
            'params.UpdateExpression is not empty, please use the UpdateRequest.operations() method to define all the update operations',
          )
        }
        break
      default:
        ;(<any>params)[expressionType] = `${expression} AND ${nameSafeCondition.statement}`
    }
  } else {
    ;(<any>params)[expressionType] = nameSafeCondition.statement
  }
}
