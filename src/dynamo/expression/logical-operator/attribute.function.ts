import { ModelConstructor } from '../../../model'
import { propertyDefinitionFunction } from '../request-expression-builder'
import {
  ConditionExpressionDefinitionChain,
  ConditionExpressionDefinitionChainTyped,
} from '../type/condition-expression-definition-chain'


/**
 * Use this method when accessing a top level attribute of a model
 */
export function attribute2<T, K extends keyof T>(modelConstructor: ModelConstructor<T>, attributePath: K)
  : ConditionExpressionDefinitionChainTyped<T, K> {
  return propertyDefinitionFunction<T, K>(attributePath)
}

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
