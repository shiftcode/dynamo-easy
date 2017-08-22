import {
  ExpressionAttributeNameMap,
  ExpressionAttributeValueMap,
  QueryInput,
  ScanInput,
} from 'aws-sdk/clients/dynamodb'
import * as _ from 'lodash'
import { Condition } from './condition.model'

export class ParamUtil {
  static addFilterCondition<T>(condition: Condition, params: QueryInput | ScanInput) {
    if (_.isString(params.FilterExpression)) {
      params.FilterExpression = params.FilterExpression + ' AND (' + condition.statement + ')'
    } else {
      params.FilterExpression = '(' + condition.statement + ')'
    }
  }

  static addKeyCondition<T>(condition: Condition, params: QueryInput) {
    this.addCondition('KeyConditionExpression', condition, params)
  }

  static addCondition(
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
