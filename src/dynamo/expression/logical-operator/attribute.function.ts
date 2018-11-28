import { propertyDefinitionFunction } from '../request-expression-builder'
import { ConditionExpressionDefinitionChain } from '../type/condition-expression-definition-chain'

/**
 * Use this method when accessing a top level attribute of a model
 */
export function attribute<T>(attributePath: keyof T): ConditionExpressionDefinitionChain

/**
 * Use this method when accessing a nested attribute of a model
 */
export function attribute(attributePath: string): ConditionExpressionDefinitionChain

export function attribute<T>(attributePath: keyof T): ConditionExpressionDefinitionChain {
  return propertyDefinitionFunction<T>(attributePath)
}
