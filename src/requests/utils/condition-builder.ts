import * as _ from 'lodash'
import { Request } from '../request.model'
import { ConditionFunction, ConditionFunctionA } from './condition-function'
import { ConditionOperator } from './condition-operator.type'
import { Expressions } from './expressions'
import { Condition } from './condition.model'
import { ExpressionAttributeValueMap, QueryInput, ScanInput } from 'aws-sdk/clients/dynamodb'
import { isEmpty, isString } from 'lodash'
import { PropertyMetadata } from '../../decorator/property-metadata.model'
import { ParamUtil } from './param-util'
import { RangeKeyConditionFunction } from './range-key-condition-function'

export class ConditionBuilder {
  static addCondition<T extends Request<any, any>>(keyName: string, request: T, propetyMetadata?: PropertyMetadata<any>): ConditionFunction<T> {
    const f = (operator: ConditionOperator) => {
      return (/* values */): T => {
        const copy = Array.prototype.slice.call(arguments)
        const existingValueKeys = _.keys(request.params.ExpressionAttributeValues)
        const args = [keyName, propetyMetadata, operator, existingValueKeys].concat(copy)
        const cond = Expressions.buildFilterExpression.apply(null, args)
        ParamUtil.addFilterCondition(cond, request.params)
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

  static addKeyCondition<T extends Request<any, any>>(keyName: string, request: T, propetyMetadata?: PropertyMetadata<any>): RangeKeyConditionFunction<T> {
    const f = (operator: ConditionOperator) => {
      return (/* values */): T => {
        const copy = Array.prototype.slice.call(arguments)
        const existingValueKeys = _.keys(request.params.ExpressionAttributeValues)
        const args = [keyName, propetyMetadata, operator, existingValueKeys].concat(copy)
        const cond = Expressions.buildFilterExpression.apply(null, args)
        ParamUtil.addKeyCondition(cond, request.params)
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

  static build<T>(keyName: string, propertyMetadata: PropertyMetadata<any>, expressionAttributeValues?: ExpressionAttributeValueMap): ConditionFunctionA {
    const f = (operator: ConditionOperator) => {
      return (/* values */): Condition => {
        const copy = Array.prototype.slice.call(arguments)
        const existingValueKeys = expressionAttributeValues ? _.keys(expressionAttributeValues) : []
        const args = [keyName, propertyMetadata, operator, existingValueKeys].concat(copy)
        const cond = Expressions.buildFilterExpression.apply(null, args)
        return cond
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
