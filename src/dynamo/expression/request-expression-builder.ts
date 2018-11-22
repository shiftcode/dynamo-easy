import { curry } from 'lodash'
import { Metadata } from '../../decorator/metadata'
import { BaseRequest } from '../request/base.request'
import { buildFilterExpression } from './condition-expression-builder'
import { addExpression } from './param-util'
import { ConditionExpressionDefinitionChain } from './type/condition-expression-definition-chain'
import { ConditionExpressionDefinitionFunction } from './type/condition-expression-definition-function'
import { OperatorAlias } from './type/condition-operator-alias.type'
import { OPERATOR_TO_ALIAS_MAP } from './type/condition-operator-to-alias-map.const'
import { ConditionOperator } from './type/condition-operator.type'
import { ExpressionType } from './type/expression-type.type'
import { Expression } from './type/expression.type'
import { RequestConditionFunction } from './type/request-condition-function'
import { RequestSortKeyConditionFunction } from './type/sort-key-condition-function'
import { UpdateActionDef } from './type/update-action-def'
import { UPDATE_ACTION_DEFS } from './type/update-action-defs.const'
import {
  UpdateExpressionDefinitionChain,
  UpdateExpressionDefinitionChainTyped,
} from './type/update-expression-definition-chain'
import { UpdateExpressionDefinitionFunction } from './type/update-expression-definition-function'
import { UpdateExpression } from './type/update-expression.type'
import { buildUpdateExpression } from './update-expression-builder'

/**
 * Adds a condition to the given query.
 */
export function addCondition<T extends BaseRequest<any, any>>(
  expressionType: ExpressionType,
  attributePath: string,
  request: T,
  metadata?: Metadata<any>,
): RequestConditionFunction<T> {
  const f = (operator: ConditionOperator) => {
    return (...values: any[]): T => {
      return doAddCondition(expressionType, attributePath, request, metadata, operator, ...values)
    }
  }

  return createConditionFunctions<RequestConditionFunction<T>>(f)
}

export function addSortKeyCondition<T extends BaseRequest<any, any>>(
  keyName: string,
  request: T,
  metadata?: Metadata<any>,
): RequestSortKeyConditionFunction<T> {
  const f = (operator: ConditionOperator) => {
    return (...values: any[]): T => {
      return doAddCondition('KeyConditionExpression', keyName, request, metadata, operator, ...values)
    }
  }

  // only a subset of available operators are supported for sort keys
  return createConditionFunctions(f, '=', '<=', '<', '>', '>=', 'begins_with', 'BETWEEN')
}

export function doAddCondition<T extends BaseRequest<any, any>>(
  expressionType: ExpressionType,
  attributePath: string,
  request: T,
  metadata: Metadata<any> | undefined,
  operator: ConditionOperator,
  ...values: any[]
): T {
  const copy = [...values]
  const existingValueKeys = request.params.ExpressionAttributeValues
    ? Object.keys(request.params.ExpressionAttributeValues)
    : []
  const condition = buildFilterExpression(attributePath, operator, copy, existingValueKeys, metadata)

  addExpression(expressionType, condition, request.params)
  return request
}

export function addPartitionKeyCondition<T extends BaseRequest<any, any>>(
  keyName: string,
  keyValue: any,
  request: T,
  metadata?: Metadata<any>,
): T {
  return addSortKeyCondition(keyName, request, metadata).equals(keyValue)
}

export function updateDefinitionFunction(attributePath: string): UpdateExpressionDefinitionChain
export function updateDefinitionFunction<T>(attributePath: keyof T): UpdateExpressionDefinitionChain
export function updateDefinitionFunction<T, K extends keyof T>(
  attributePath: K,
): UpdateExpressionDefinitionChainTyped<T, K>

export function updateDefinitionFunction<T>(attributePath: keyof T): UpdateExpressionDefinitionChain {
  const f = (operation: UpdateActionDef) => {
    return (...values: any[]): UpdateExpressionDefinitionFunction => {
      const copy = [...values]
      const curried = curry<
        string,
        UpdateActionDef,
        any[],
        string[] | undefined,
        Metadata<any> | undefined,
        UpdateExpression
      >(buildUpdateExpression)

      return curried(<string>attributePath, operation, copy)
    }
  }

  return createUpdateFunctions<UpdateExpressionDefinitionChain>(f)
}

export function propertyDefinitionFunction<T>(attributePath: keyof T): ConditionExpressionDefinitionChain {
  const f = (operator: ConditionOperator) => {
    return (...values: any[]): ConditionExpressionDefinitionFunction => {
      const copy = [...values]
      const curried = curry<string, ConditionOperator, any[], string[], Metadata<any>, Expression>(
        buildFilterExpression,
      )
      return <ConditionExpressionDefinitionFunction>curried(<string>attributePath, operator, copy)
    }
  }

  return createConditionFunctions<ConditionExpressionDefinitionChain>(f)
}

/**
 * Creates an object which contains callable functions for all update operations defined in update-operation type
 * for all the values included in operators
 *
 * @param {(operator: ConditionOperator) => any} impl The function which is called with the operator and returns a function which expects the value
 * for the condition. when executed the implementation defines what to do with the condition, just return it for example or add the condition to the request
 * parameters as another example
 */
function createUpdateFunctions<T>(impl: (operation: UpdateActionDef) => any): T {
  return UPDATE_ACTION_DEFS.reduce(
    (result: T, updateActionDef: UpdateActionDef) => {
      Reflect.set(<any>result, updateActionDef.action, impl(updateActionDef))

      return result
    },
    <T>{},
  )
}

/**
 * Creates an object which contains callable functions for all aliases defined in CONDITION_OPERATOR_ALIAS or if operators parameter is defined,
 * for all the values included in operators
 *
 * @param {(operator: ConditionOperator) => any} impl The function which is called with the operator and returns a function which expects the value
 * for the condition. when executed the implementation defines what to do with the condition, just return it for example or add the condition to the request
 * parameters as another example
 */
function createConditionFunctions<T>(impl: (operator: ConditionOperator) => any, ...operators: ConditionOperator[]): T {
  const includedAlias: ConditionOperator[] =
    operators && operators.length ? operators : <ConditionOperator[]>Object.keys(OPERATOR_TO_ALIAS_MAP)

  return includedAlias.reduce(
    (result: T, operator: ConditionOperator) => {
      const alias: OperatorAlias | OperatorAlias[] = OPERATOR_TO_ALIAS_MAP[operator]
      if (Array.isArray(alias)) {
        alias.forEach(a => Reflect.set(<any>result, a, impl(operator)))
      } else {
        Reflect.set(<any>result, alias, impl(operator))
      }

      return result
    },
    <T>{},
  )
}
