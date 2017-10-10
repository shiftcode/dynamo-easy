/**
 * Use this method when accesing a top level attribute of a model
 */
import { RequestExpressionBuilder } from '../request-expression-builder'
import { UpdateExpressionDefinitionChain } from '../type/update-expression-definition-chain'

export function update<T>(attributePath: keyof T): UpdateExpressionDefinitionChain

/**
 * Use this method when accessing a nested attribute of a model
 */
export function update(attributePath: string): UpdateExpressionDefinitionChain

export function update<T>(attributePath: keyof T): UpdateExpressionDefinitionChain {
  return RequestExpressionBuilder.updateDefinitionFunction<T>(attributePath)
}
