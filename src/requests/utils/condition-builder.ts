import { ExpressionAttributeValueMap } from 'aws-sdk/clients/dynamodb'
import { PropertyMetadata } from '../../decorator/property-metadata.model'
import { Request } from '../request.model'
import { ConditionFunction } from './condition-function'
import { ConditionFunctionA } from './condition-function-a'
import { ConditionOperator } from './condition-operator.type'
import { Condition } from './condition.model'
import { Expressions } from './expressions'
import { ParamUtil } from './param-util'
import { RangeKeyConditionFunction } from './range-key-condition-function'

export class ConditionBuilder {
  static addCondition<T extends Request<any, any>>(
    keyName: string,
    request: T,
    propetyMetadata?: PropertyMetadata<any>
  ): ConditionFunction<T> {
    const f = (operator: ConditionOperator) => {
      return (...values: any[]): T => {
        const conditionChain = ConditionBuilder.build(
          keyName,
          propetyMetadata,
          request.params.ExpressionAttributeValues
        )
        const condition: Condition = (<any>conditionChain)[operator](values)
        ParamUtil.addFilterCondition(condition, request.params)
        return request
      }
    }

    return {
      equals: f('='),
      eq: f('='),
      ne: f('<>'),
      lte: f('<='),
      lt: f('<'),
      gte: f('>='),
      gt: f('>'),
      null: f('attribute_not_exists'),
      notNull: f('attribute_exists'),
      contains: f('contains'),
      notContains: f('NOT contains'),
      in: f('IN'),
      beginsWith: f('begins_with'),
      between: f('BETWEEN'),
    }
  }

  static addKeyCondition<T extends Request<any, any>>(
    keyName: string,
    request: T,
    propetyMetadata?: PropertyMetadata<any>
  ): RangeKeyConditionFunction<T> {
    const f = (operator: ConditionOperator) => {
      return (...values: any[]): T => {
        const conditionChain = ConditionBuilder.build(
          keyName,
          propetyMetadata,
          request.params.ExpressionAttributeValues
        )
        const condition: Condition = (<any>conditionChain)[operator](values)
        ParamUtil.addKeyCondition(condition, request.params)
        return request
      }
    }

    return {
      equals: f('='),
      eq: f('='),
      lte: f('<='),
      lt: f('<'),
      gte: f('>='),
      gt: f('>'),
      beginsWith: f('begins_with'),
      between: f('BETWEEN'),
    }
  }

  static build<T>(
    keyName: string,
    propertyMetadata?: PropertyMetadata<any>,
    expressionAttributeValues?: ExpressionAttributeValueMap
  ): ConditionFunctionA {
    const f = (operator: ConditionOperator) => {
      return (...values: any[]): Condition => {
        const copy = [...values]
        const existingValueKeys = expressionAttributeValues ? Object.keys(expressionAttributeValues) : []
        return Expressions.buildFilterExpression(keyName, operator, values, existingValueKeys, propertyMetadata)
      }
    }

    return {
      equals: f('='),
      eq: f('='),
      ne: f('<>'),
      lte: f('<='),
      lt: f('<'),
      gte: f('>='),
      gt: f('>'),
      null: f('attribute_not_exists'),
      notNull: f('attribute_exists'),
      contains: f('contains'),
      notContains: f('NOT contains'),
      in: f('IN'),
      beginsWith: f('begins_with'),
      between: f('BETWEEN'),
    }
  }
}
