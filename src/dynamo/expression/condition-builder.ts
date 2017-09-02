import { ExpressionAttributeValueMap } from 'aws-sdk/clients/dynamodb'
import { MetadataHelper } from '../../decorator/metadata/metadata-helper'
import { PropertyMetadata } from '../../decorator/metadata/property-metadata.model'
import { Util } from '../../mapper/util'
import { ModelConstructor } from '../../model/model-constructor'
import { Request } from '../request/request.model'
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
 * Provides an api to build conditions
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
  static addCondition<T extends Request<any, any>>(
    keyName: string,
    request: T,
    propetyMetadata?: PropertyMetadata<any>
  ): RequestConditionFunction<T> {
    const f = (operator: ConditionOperator) => {
      return (...values: any[]): T => {
        const conditionChain = ConditionBuilder.where(
          keyName,
          propetyMetadata,
          request.params.ExpressionAttributeValues
        )

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

  static addRangeKeyCondition<T extends Request<any, any>>(
    keyName: string,
    request: T,
    propertyMetadata?: PropertyMetadata<any>
  ): RequestRangeKeyConditionFunction<T> {
    const f = (operator: ConditionOperator) => {
      return (...values: any[]): T => {
        const conditionChain = ConditionBuilder.where(
          keyName,
          propertyMetadata,
          request.params.ExpressionAttributeValues
        )
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

  static addPartitionKeyCondition<T extends Request<any, any>>(
    keyName: string,
    keyValue: any,
    request: T,
    propertyMetadata?: PropertyMetadata<any>
  ): T {
    return ConditionBuilder.addRangeKeyCondition(keyName, request, propertyMetadata).equals(keyValue)
  }

  static where<T>(
    keyName: string,
    propertyMetadata?: PropertyMetadata<any>,
    expressionAttributeValues?: ExpressionAttributeValueMap
  ): ConditionFunction {
    const f = (operator: ConditionOperator) => {
      return (...values: any[]): Condition => {
        const copy = [...values]
        const existingValueKeys = expressionAttributeValues ? Object.keys(expressionAttributeValues) : []
        return Expressions.buildFilterExpression(keyName, operator, values, existingValueKeys, propertyMetadata)
      }
    }

    // TODO move out of call is always the same, static member
    return ConditionBuilder.createConditionFunctions<ConditionFunction>(f)
  }

  static whereRangeKey(
    keyName: string,
    propertyMetadata?: PropertyMetadata<any>,
    expressionAttributeValues?: ExpressionAttributeValueMap
  ): RangeKeyConditionFunction {
    const f = (operator: ConditionOperator) => {
      return (...values: any[]): Condition => {
        const conditionChain = ConditionBuilder.where(keyName, propertyMetadata, expressionAttributeValues)
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
    propertyMetadata?: PropertyMetadata<any>,
    expressionAttributeValues?: ExpressionAttributeValueMap
  ): Condition {
    let keyName: string
    if (typeof value === 'string') {
      keyName = value
    } else {
      keyName = MetadataHelper.get(<ModelConstructor<any>>value).getPartitionKey()
    }

    return ConditionBuilder.where(keyName, propertyMetadata, expressionAttributeValues).equals(keyValue)
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
