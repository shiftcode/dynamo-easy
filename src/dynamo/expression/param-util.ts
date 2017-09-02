import {
  ExpressionAttributeNameMap,
  ExpressionAttributeValueMap,
  QueryInput,
  ScanInput,
} from 'aws-sdk/clients/dynamodb'
import * as _ from 'lodash'
import { Condition } from './type/condition.type'

export class ParamUtil {
  static addFilterExpression<T>(condition: Condition, params: QueryInput | ScanInput): void {
    this.addExpression('FilterExpression', condition, params)
  }

  static addKeyConditionExpression<T>(condition: Condition, params: QueryInput): void {
    this.addExpression('KeyConditionExpression', condition, params)
  }

  private static addExpression(
    expressionType: 'KeyConditionExpression' | 'FilterExpression',
    condition: Condition,
    params: QueryInput | ScanInput
  ) {
    const expressionAttributeNames = <ExpressionAttributeNameMap>{
      ...condition.attributeNames,
      ...params.ExpressionAttributeNames,
    }

    const expressionAttributeValues = <ExpressionAttributeValueMap>{
      ...condition.attributeMap,
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
      ;(<any>params)[expressionType] = (<any>params).KeyConditionExpression + ' AND (' + condition.statement + ')'
    } else {
      ;(<any>params)[expressionType] = '(' + condition.statement + ')'
    }
  }
}
