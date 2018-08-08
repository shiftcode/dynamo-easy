import {
  ExpressionAttributeNameMap,
  ExpressionAttributeValueMap,
  QueryInput,
  ScanInput,
  UpdateItemInput,
} from 'aws-sdk/clients/dynamodb'
import { isEmpty, isString } from 'lodash-es'
import { Expression } from './type/expression.type'

export class ParamUtil {
  static addUpdateExpression(updateExpression: Expression, params: UpdateItemInput) {
    ParamUtil.addExpression('UpdateExpression', updateExpression, params)
  }

  static addExpression(
    expressionType: 'ConditionExpression' | 'KeyConditionExpression' | 'FilterExpression' | 'UpdateExpression',
    condition: Expression,
    params: QueryInput | ScanInput | UpdateItemInput
  ) {
    const expressionAttributeNames = <ExpressionAttributeNameMap>{
      ...condition.attributeNames,
      ...params.ExpressionAttributeNames,
    }

    const expressionAttributeValues = <ExpressionAttributeValueMap>{
      ...condition.attributeValues,
      ...params.ExpressionAttributeValues,
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
              'params.UpdateExpression is not empty, please use the UpdateRequest.operations() method to define all the update operations'
            )
          }
          break
        default:
          ;(<any>params)[expressionType] = `${expression} AND ${condition.statement}`
      }
    } else {
      ;(<any>params)[expressionType] = condition.statement
    }
  }
}
