import { ExpressionAttributeValueMap } from 'aws-sdk/clients/dynamodb'
import { PropertyMetadata } from '../../decorator/property-metadata.model'
import { Request } from '../request.model'
import { ConditionFunction } from './condition-function'
import { ConditionFunctionA } from './condition-function-a'
import { aliasForOperator, CONDITION_OPERATOR_ALIAS, ConditionOperator, OperatorAlias } from './condition-operator.type'
import { Condition } from './condition.model'
import { Expressions } from './expressions'
import { ParamUtil } from './param-util'
import { RangeKeyConditionFunction } from './range-key-condition-function'

/**
 * Provides an api to build conditions
 */
export class ConditionBuilder {
  /**
   * Adds a condition to the given query.
   *
   * @param {string} keyName
   * @param {T} request
   * @param {PropertyMetadata<any>} propetyMetadata
   * @returns {ConditionFunction<T extends Request<any, any>>}
   */
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

        if (Reflect.has(conditionChain, operator)) {
          const condition: Condition = (<any>conditionChain)[operator](values)
          ParamUtil.addFilterExpression(condition, request.params)
          return request
        } else {
          throw new Error(`there is no operator function available on condition chaing for operator ${operator}`)
        }
      }
    }

    return ConditionBuilder.createConditionFunctions<ConditionFunction<T>>(f)
  }

  static addKeyCondition<T extends Request<any, any>>(
    keyName: string,
    request: T,
    propertyMetadata?: PropertyMetadata<any>
  ): RangeKeyConditionFunction<T> {
    const f = (operator: ConditionOperator) => {
      return (...values: any[]): T => {
        const conditionChain = ConditionBuilder.build(
          keyName,
          propertyMetadata,
          request.params.ExpressionAttributeValues
        )
        const alias = aliasForOperator(operator)
        const condition: Condition = (<any>conditionChain)[alias](...values)
        ParamUtil.addKeyConditionExpression(condition, request.params)
        return request
      }
    }

    // only a subset of available operators are supported for range keys
    return ConditionBuilder.createConditionFunctions(f, '=', '<=', '<', '>', '>=', 'begins_with', 'BETWEEN')
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

    return ConditionBuilder.createConditionFunctions<ConditionFunctionA>(f)
  }

  /**
   * Creates an object which contains callable functions for all aliases defined in CONDITION_OPERATOR_ALIAS or if operators parameter is defined,
   * for all the values included in operators
   *
   * @param {(operator: ConditionOperator) => any} impl
   * @param {ConditionOperator} operators
   * @returns {T}
   */
  private static createConditionFunctions<T>(
    impl: (operator: ConditionOperator) => any,
    ...operators: ConditionOperator[]
  ): T {
    const includedAlias: ConditionOperator[] =
      operators && operators.length ? operators : <ConditionOperator[]>Object.keys(CONDITION_OPERATOR_ALIAS)

    return <T>includedAlias.reduce((result: T, operator: ConditionOperator) => {
      const alias: OperatorAlias | OperatorAlias[] = CONDITION_OPERATOR_ALIAS[operator]
      if (Array.isArray(alias)) {
        alias.forEach(a => Reflect.set(<any>result, a, impl(operator)))
      } else {
        Reflect.set(<any>result, alias, impl(operator))
      }

      return result
    }, <T>{})
  }
}
