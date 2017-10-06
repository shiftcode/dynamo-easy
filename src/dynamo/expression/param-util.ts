import {
  ExpressionAttributeNameMap,
  ExpressionAttributeValueMap,
  QueryInput,
  ScanInput,
  UpdateItemInput,
} from 'aws-sdk/clients/dynamodb'
import { isEmpty, isString } from 'lodash'
import { UpdateRequest } from '../request/update/update.request'
import { Expression } from './type/expression.type'

export class ParamUtil {
  static addExpression(
    expressionType: 'ConditionExpression' | 'KeyConditionExpression' | 'FilterExpression',
    condition: Expression,
    params: QueryInput | ScanInput
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
      ;(<any>params)[expressionType] = `${expression} AND ${condition.statement}`
      // throw new Error(
      //   'please use the logical operators and / or / not to define complex expressions instead of just adding it the an existing condition'
      // )
    } else {
      ;(<any>params)[expressionType] = condition.statement
    }
  }

  static addUpdateExpression(updateExpression: Expression, params: UpdateItemInput) {
    const expressionType = 'UpdateExpression'
    // FIXME refactor remove duplicate code
    const expressionAttributeNames = <ExpressionAttributeNameMap>{
      ...updateExpression.attributeNames,
      ...params.ExpressionAttributeNames,
    }

    const expressionAttributeValues = <ExpressionAttributeValueMap>{
      ...updateExpression.attributeValues,
      ...params.ExpressionAttributeValues,
    }

    if (!isEmpty(expressionAttributeNames)) {
      params.ExpressionAttributeNames = expressionAttributeNames
    }

    if (!isEmpty(expressionAttributeValues)) {
      params.ExpressionAttributeValues = expressionAttributeValues
    }

    const expression = Reflect.get(params, expressionType)
    if (isString(expression) && expression !== '') {
      throw new Error(
        'params.UpdateExpression is not empty, please use the UpdateRequest.operations() method to define all the update operations'
      )
    } else {
      ;(<any>params)[expressionType] = updateExpression.statement
    }
  }
}
