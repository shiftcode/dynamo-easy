import { ExpressionAttributeValueMap } from 'aws-sdk/clients/dynamodb'
import { Metadata } from '../../decorator/metadata/metadata'
import { MetadataHelper } from '../../decorator/metadata/metadata-helper'
import { PropertyMetadata } from '../../decorator/metadata/property-metadata.model'
import { Util } from '../../mapper/util'
import { ModelConstructor } from '../../model/model-constructor'
import { BaseRequest } from '../request/base.request'
import { Expressions } from './expressions'
import { ParamUtil } from './param-util'
import { ConditionFunction } from './type/condition-function'
import { aliasForOperator, ConditionOperator } from './type/condition-operator.type'
import { Condition } from './type/condition.type'
import { OperatorAlias } from './type/operator-alias.type'
import { OPERATOR_TO_ALIAS_MAP } from './type/operator-to-alias-map'
import { RequestRangeKeyConditionFunction } from './type/range-key-condition-function'
import { RangeKeyConditionFunction } from './type/range-key-condition-function.type'
import { RequestConditionFunction } from './type/request-condition-function'

/**
 * Provides an api to build condition expressions
 * see http://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.ConditionExpressions.html
 */
export class ConditionBuilder {
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
        const conditionChain = ConditionBuilder.where(keyName, metadata, request.params.ExpressionAttributeValues)

        const alias = aliasForOperator(operator)
        if (Reflect.has(conditionChain, alias)) {
          const condition: Condition = (<any>conditionChain)[alias](...values)
          ParamUtil.addFilterExpression(condition, request.params)
          return request
        } else {
          throw new Error(`there is no operator function available on condition chaing for operator ${operator}`)
        }
      }
    }

    return ConditionBuilder.createConditionFunctions<RequestConditionFunction<T>>(f)
  }

  static addRangeKeyCondition<T extends BaseRequest<any, any>>(
    keyName: string,
    request: T,
    metadata?: Metadata<any>
  ): RequestRangeKeyConditionFunction<T> {
    const f = (operator: ConditionOperator) => {
      return (...values: any[]): T => {
        const conditionChain = ConditionBuilder.where(keyName, metadata, request.params.ExpressionAttributeValues)
        const alias = aliasForOperator(operator)
        if (Reflect.has(conditionChain, alias)) {
          const condition: Condition = (<any>conditionChain)[alias](...values)
          ParamUtil.addKeyConditionExpression(condition, request.params)
          return request
        } else {
          throw new Error(`there is no operator function available on condition chaing for operator ${operator}`)
        }
      }
    }

    // only a subset of available operators are supported for range keys
    return ConditionBuilder.createConditionFunctions(f, '=', '<=', '<', '>', '>=', 'begins_with', 'BETWEEN')
  }

  static addPartitionKeyCondition<T extends BaseRequest<any, any>>(
    keyName: string,
    keyValue: any,
    request: T,
    metadata?: Metadata<any>
  ): T {
    return ConditionBuilder.addRangeKeyCondition(keyName, request, metadata).equals(keyValue)
  }

  static where<T>(
    keyName: string,
    metadata?: Metadata<any>,
    expressionAttributeValues?: ExpressionAttributeValueMap
  ): ConditionFunction {
    const f = (operator: ConditionOperator) => {
      return (...values: any[]): Condition => {
        const copy = [...values]
        const existingValueKeys = expressionAttributeValues ? Object.keys(expressionAttributeValues) : []
        return Expressions.buildFilterExpression(keyName, operator, values, existingValueKeys, metadata)
      }
    }

    return ConditionBuilder.createConditionFunctions<ConditionFunction>(f)
  }

  static whereRangeKey(
    keyName: string,
    metadata?: Metadata<any>,
    expressionAttributeValues?: ExpressionAttributeValueMap
  ): RangeKeyConditionFunction {
    const f = (operator: ConditionOperator) => {
      return (...values: any[]): Condition => {
        const conditionChain = ConditionBuilder.where(keyName, metadata, expressionAttributeValues)
        const alias = aliasForOperator(operator)
        const condition: Condition = (<any>conditionChain)[alias](...values)
        return condition
      }
    }

    // only a subset of available operators are supported for range keys
    return ConditionBuilder.createConditionFunctions(f, '=', '<=', '<', '>', '>=', 'begins_with', 'BETWEEN')
  }

  static wherePartitionKey(
    value: string | ModelConstructor<any>,
    keyValue: any,
    metadata?: Metadata<any>,
    expressionAttributeValues?: ExpressionAttributeValueMap
  ): Condition {
    let keyName: string
    if (typeof value === 'string') {
      keyName = value
    } else {
      keyName = MetadataHelper.get(<ModelConstructor<any>>value).getPartitionKey()
    }

    return ConditionBuilder.where(keyName, metadata, expressionAttributeValues).equals(keyValue)
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
   *
   * TODO make private
   */
  static createConditionFunctions<T>(impl: (operator: ConditionOperator) => any, ...operators: ConditionOperator[]): T {
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
