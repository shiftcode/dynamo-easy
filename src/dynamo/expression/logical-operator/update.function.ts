/**
 * @module expression
 */
import { ModelConstructor } from '../../../model/model-constructor'
import { updateDefinitionFunction } from '../request-expression-builder'
import {
  UpdateExpressionDefinitionChain,
  UpdateExpressionDefinitionChainTyped,
} from '../type/update-expression-definition-chain'

/**
 * Use this method when accessing a top level attribute of a model with strict typing of the value in chained function
 * @example
 * ```typescript
 * @Model()
 * class Person {
 *
 *   @PartitionKey()
 *   id: string
 *   age: number
 * }
 *
 * personStore.update('idValue')
 *  .operations(update2(Person, 'age').set(5))
 *  .exec()
 * ```
 *
 * When using the update2 we have type support for the set (and all other update functions) value,
 * it can only be number, because the type of age is number too, this only works when not using a custom mapper.
 * The downside of the strict typing is the model constructor parameter which is only required for typing reasons.
 */
export function update2<T, K extends keyof T>(
  _modelConstructor: ModelConstructor<T>,
  attributePath: K,
): UpdateExpressionDefinitionChainTyped<T, K> {
  return updateDefinitionFunction<T, K>(attributePath)
}

/**
 * Use this method when accessing a top level attribute of a model to have type checking for attributePath
 * @example
 * ```typescript
 * update('myProp').set('foo')
 * ```
 */
export function update<T>(attributePath: keyof T): UpdateExpressionDefinitionChain

/**
 * Use this method when accessing a nested attribute of a model
 */
export function update(attributePath: string): UpdateExpressionDefinitionChain

export function update<T>(attributePath: keyof T): UpdateExpressionDefinitionChain {
  return updateDefinitionFunction<T>(attributePath)
}
