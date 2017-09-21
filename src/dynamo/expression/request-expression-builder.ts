import { curry } from 'lodash'
import { Metadata } from '../../decorator/metadata/metadata'
import { PropertyMetadata } from '../../decorator/metadata/property-metadata.model'
import { BaseRequest } from '../request/base.request'
import { ConditionExpressionBuilder } from './condition-expression-builder'
import { ParamUtil } from './param-util'
import { ConditionExpressionDefinitionChain } from './type/condition-expression-definition-chain'
import { ConditionExpressionDefinitionFunction } from './type/condition-expression-definition-function'
import { ConditionExpression } from './type/condition-expression.type'
import { OperatorAlias } from './type/condition-operator-alias.type'
import { OPERATOR_TO_ALIAS_MAP } from './type/condition-operator-to-alias-map.const'
import { ConditionOperator } from './type/condition-operator.type'
import { RequestConditionFunction } from './type/request-condition-function'
import { RequestSortKeyConditionFunction } from './type/sort-key-condition-function'

type ExpressionType = 'ConditionExpression' | 'FilterExpression' | 'KeyConditionExpression'

/**
 *
 */
export class RequestExpressionBuilder {
  /**
   * Adds a condition to the given query.
   *
   * @param {string} keyName
   * @param {T} request
   * @param {PropertyMetadata<any>} propetyMetadata
   * @returns {RequestConditionFunction<T extends Request<any, any>>}
   */
  static addCondition<T extends BaseRequest<any, any>>(
    keyName: string,
    request: T,
    metadata?: Metadata<any>
  ): RequestConditionFunction<T> {
    const f = (operator: ConditionOperator) => {
      return (...values: any[]): T => {
        return RequestExpressionBuilder.bla('FilterExpression', keyName, request, metadata, operator, ...values)
      }
    }

    return RequestExpressionBuilder.createConditionFunctions<RequestConditionFunction<T>>(f)
  }

  static addSortKeyCondition<T extends BaseRequest<any, any>>(
    keyName: string,
    request: T,
    metadata?: Metadata<any>
  ): RequestSortKeyConditionFunction<T> {
    const f = (operator: ConditionOperator) => {
      return (...values: any[]): T => {
        return RequestExpressionBuilder.bla('KeyConditionExpression', keyName, request, metadata, operator, ...values)
      }
    }

    // only a subset of available operators are supported for range keys
    return RequestExpressionBuilder.createConditionFunctions(f, '=', '<=', '<', '>', '>=', 'begins_with', 'BETWEEN')
  }

  private static bla<T extends BaseRequest<any, any>>(
    expressionType: ExpressionType,
    keyName: string,
    request: T,
    metadata: Metadata<any> | undefined,
    operator: ConditionOperator,
    ...values: any[]
  ): T {
    const copy = [...values]
    const existingValueKeys = request.params.ExpressionAttributeValues
      ? Object.keys(request.params.ExpressionAttributeValues)
      : []
    const condition = ConditionExpressionBuilder.buildFilterExpression(
      keyName,
      operator,
      values,
      existingValueKeys,
      metadata
    )

    ParamUtil.addExpression(expressionType, condition, request.params)
    return request
  }

  static addPartitionKeyCondition<T extends BaseRequest<any, any>>(
    keyName: string,
    keyValue: any,
    request: T,
    metadata?: Metadata<any>
  ): T {
    return RequestExpressionBuilder.addSortKeyCondition(keyName, request, metadata).equals(keyValue)
  }

  static propertyDefinitionFunction<T>(keyName: keyof T): ConditionExpressionDefinitionChain {
    const f = (operator: ConditionOperator) => {
      return (...values: any[]): ConditionExpressionDefinitionFunction => {
        const copy = [...values]
        const curried = curry<string, ConditionOperator, any[], string[], Metadata<any>, ConditionExpression>(
          ConditionExpressionBuilder.buildFilterExpression
        )
        return curried(keyName, operator, values)
      }
    }

    return RequestExpressionBuilder.createConditionFunctions<ConditionExpressionDefinitionChain>(f)
  }

  /**
   * Creates an object which contains callable functions for all aliases defined in CONDITION_OPERATOR_ALIAS or if operators parameter is defined,
   * for all the values included in operators
   *
   * @param {(operator: ConditionOperator) => any} impl The function which is called with the operator and returns a function which expects the value
   * for the condition. when executed the implementation defines what todo with the condition, just return it for example or add the condition to the request
   * parameters as another example
   *
   * @param {ConditionOperator} operators
   * @returns {T}
   */
  private static createConditionFunctions<T>(
    impl: (operator: ConditionOperator) => any,
    ...operators: ConditionOperator[]
  ): T {
    const includedAlias: ConditionOperator[] =
      operators && operators.length ? operators : <ConditionOperator[]>Object.keys(OPERATOR_TO_ALIAS_MAP)

    return <T>includedAlias.reduce(
      (result: T, operator: ConditionOperator) => {
        const alias: OperatorAlias | OperatorAlias[] = OPERATOR_TO_ALIAS_MAP[operator]
        if (Array.isArray(alias)) {
          alias.forEach(a => Reflect.set(<any>result, a, impl(operator)))
        } else {
          Reflect.set(<any>result, alias, impl(operator))
        }

        return result
      },
      <T>{}
    )
  }
}
