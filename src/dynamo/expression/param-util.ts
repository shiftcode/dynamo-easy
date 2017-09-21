import {
  ExpressionAttributeNameMap,
  ExpressionAttributeValueMap,
  QueryInput,
  ScanInput,
} from 'aws-sdk/clients/dynamodb'
import * as _ from 'lodash'
import { ConditionExpression } from './type/condition-expression.type'

export class ParamUtil {
  static addExpression(
    expressionType: 'ConditionExpression' | 'KeyConditionExpression' | 'FilterExpression',
    condition: ConditionExpression,
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

    if (!_.isEmpty(expressionAttributeNames)) {
      params.ExpressionAttributeNames = expressionAttributeNames
    }

    if (!_.isEmpty(expressionAttributeValues)) {
      params.ExpressionAttributeValues = expressionAttributeValues
    }

    const expression = Reflect.get(params, expressionType)
    if (_.isString(expression)) {
      throw new Error(
        'please use the logical operators and / or / not to define complex expressions instead of just adding it the an existing condition'
      )
    }

    ;(<any>params)[expressionType] = condition.statement
  }
}
