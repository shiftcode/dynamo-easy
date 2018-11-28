import { ModelConstructor } from '../../../model'
import { updateDefinitionFunction } from '../request-expression-builder'
import {
  UpdateExpressionDefinitionChain,
  UpdateExpressionDefinitionChainTyped,
} from '../type/update-expression-definition-chain'

/**
 * Use this method when accessing a top level attribute of a model
 */
export function update2<T, K extends keyof T>(
  modelConstructor: ModelConstructor<T>,
  attributePath: K,
): UpdateExpressionDefinitionChainTyped<T, K> {
  return updateDefinitionFunction<T, K>(attributePath)
}

/**
 * Use this method when accessing a top level attribute of a model
 */
export function update<T>(attributePath: keyof T): UpdateExpressionDefinitionChain

/**
 * Use this method when accessing a nested attribute of a model
 */
export function update(attributePath: string): UpdateExpressionDefinitionChain

export function update<T>(attributePath: keyof T): UpdateExpressionDefinitionChain {
  return updateDefinitionFunction<T>(attributePath)
}
