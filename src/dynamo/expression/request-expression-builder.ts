import { curry } from 'lodash'
import { Metadata } from '../../decorator/metadata/metadata'
import { ConditionalParamsHost, UpdateParamsHost } from '../operation-params.type'
import { StandardRequest } from '../request/standard.request'
import { buildFilterExpression } from './condition-expression-builder'
import { addExpression } from './param-util'
import { prepareAndAddUpdateExpressions } from './prepare-and-add-update-expressions.function'
import {
  ConditionExpressionDefinitionChain,
  ConditionExpressionDefinitionChainTyped,
  RequestConditionFunctionTyped,
} from './type/condition-expression-definition-chain'
import { ConditionExpressionDefinitionFunction } from './type/condition-expression-definition-function'
import { OperatorAlias } from './type/condition-operator-alias.type'
import { OPERATOR_TO_ALIAS_MAP } from './type/condition-operator-to-alias-map.const'
import { ConditionOperator } from './type/condition-operator.type'
import { ExpressionType } from './type/expression-type.type'
import { Expression } from './type/expression.type'
import { SortKeyConditionFunction } from './type/sort-key-condition-function'
import { UpdateActionDef } from './type/update-action-def'
import { UPDATE_ACTION_DEFS } from './type/update-action-defs.const'
import {
  RequestUpdateFunction,
  UpdateExpressionDefinitionChain,
  UpdateExpressionDefinitionChainTyped,
} from './type/update-expression-definition-chain'
import { UpdateExpressionDefinitionFunction } from './type/update-expression-definition-function'
import { UpdateExpression } from './type/update-expression.type'
import { buildUpdateExpression } from './update-expression-builder'

/**
 * return the update-functions which then can apply an updateDefinition to the given request.params
 * and afterwards will return the request object (which allows chaining)
 * @param attributePath
 * @param request
 * @param metadata
 */
export function addUpdate<R extends UpdateParamsHost, T, K extends keyof T>(
  attributePath: K,
  request: R,
  metadata: Metadata<T>,
): RequestUpdateFunction<R, T, K> {
  // f the function to create the update functions
  const f = (operator: UpdateActionDef) => {
    // return the function the user will call in the end
    return (...values: any[]): R => {
      const copy = [...values]
      const curried = curry<
        string,
        UpdateActionDef,
        any[],
        string[] | undefined,
        Metadata<any> | undefined,
        UpdateExpression
      >(buildUpdateExpression)
      const updateDefFn: UpdateExpressionDefinitionFunction = curried(<string>attributePath, operator, copy)
      prepareAndAddUpdateExpressions(metadata, request.params, [updateDefFn])
      // return the request so the user can continue to chain
      return request
    }
  }
  // let the update functions be created with f
  return createUpdateFunctions<RequestUpdateFunction<R, T, K>>(f)
}

/**
 * return the condition-functions which then can apply a conditionDefinition to the given request.params
 * and afterwards will return the request object (which allows chaining)
 */
export function addCondition<R extends ConditionalParamsHost, T, K extends keyof T>(
  expressionType: ExpressionType,
  attributePath: K,
  request: R,
  metadata?: Metadata<T>,
): RequestConditionFunctionTyped<R, T, K> {
  // f the function to create the condition functions
  const f = (operator: ConditionOperator) => {
    // return the function the user will call in the end
    return (...values: any[]): R => {
      return doAddCondition(expressionType, <string>attributePath, request, metadata, operator, ...values)
    }
  }
  return createConditionFunctions<RequestConditionFunctionTyped<R, T, K>>(f)
}

export function addSortKeyCondition<R extends ConditionalParamsHost>(
  keyName: keyof any,
  request: R,
): SortKeyConditionFunction<R>

export function addSortKeyCondition<T, R extends ConditionalParamsHost>(
  keyName: keyof T,
  request: R,
  metadata: Metadata<T>,
): SortKeyConditionFunction<R>

export function addSortKeyCondition<T, R extends ConditionalParamsHost>(
  keyName: keyof T,
  request: R,
  metadata?: Metadata<T>,
): SortKeyConditionFunction<R> {
  // f the function to create the condition functions
  const f = (operator: ConditionOperator) => {
    // return the function the user will call in the end
    return (...values: any[]): R => {
      return doAddCondition('KeyConditionExpression', <string>keyName, request, metadata, operator, ...values)
    }
  }

  // only a subset of available operators are supported for sort keys
  return createConditionFunctions(f, '=', '<=', '<', '>', '>=', 'begins_with', 'BETWEEN')
}

export function doAddCondition<T, R extends ConditionalParamsHost>(
  expressionType: ExpressionType,
  attributePath: string,
  request: R,
  metadata: Metadata<T> | undefined,
  operator: ConditionOperator,
  ...values: any[]
): R {
  const copy = [...values]
  const existingValueKeys = request.params.ExpressionAttributeValues
    ? Object.keys(request.params.ExpressionAttributeValues)
    : []
  const condition = buildFilterExpression(attributePath, operator, copy, existingValueKeys, metadata)

  addExpression(expressionType, condition, request.params)

  // return the request so the user can continue to chain
  return request
}

export function addPartitionKeyCondition<R extends StandardRequest<any, any, any>>(
  keyName: keyof any,
  keyValue: any,
  request: R,
): R
export function addPartitionKeyCondition<T, R extends StandardRequest<T, any, any>>(
  keyName: keyof T,
  keyValue: any,
  request: R,
  metadata: Metadata<T>,
): R
export function addPartitionKeyCondition<T, R extends StandardRequest<T, any, any>>(
  keyName: keyof T,
  keyValue: any,
  request: R,
  metadata?: Metadata<T>,
): R {
  if (metadata) {
    return addSortKeyCondition(keyName, request, metadata).equals(keyValue)
  } else {
    return addSortKeyCondition(keyName, request).equals(keyValue)
  }
}

export function updateDefinitionFunction(attributePath: string): UpdateExpressionDefinitionChain
export function updateDefinitionFunction<T>(attributePath: keyof T): UpdateExpressionDefinitionChain
export function updateDefinitionFunction<T, K extends keyof T>(
  attributePath: K,
): UpdateExpressionDefinitionChainTyped<T, K>
export function updateDefinitionFunction<T>(attributePath: keyof T): UpdateExpressionDefinitionChain {
  // f the function to create the update functions
  const f = (operation: UpdateActionDef) => {
    // return the function the user will call in the end
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
      // return the UpdateExpressionDefinitionFunction which the request will execute
      return curried(<string>attributePath, operation, copy)
    }
  }
  // let the update functions be created with f
  return createUpdateFunctions<UpdateExpressionDefinitionChain>(f)
}

export function propertyDefinitionFunction<T>(attributePath: keyof T): ConditionExpressionDefinitionChain
export function propertyDefinitionFunction<T, K extends keyof T>(
  attributePath: K,
): ConditionExpressionDefinitionChainTyped<T, K>
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
