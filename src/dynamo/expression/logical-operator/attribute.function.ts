/**
 * @module expression
 */
import { ModelConstructor } from '../../../model/model-constructor'
import { propertyDefinitionFunction } from '../request-expression-builder'
import {
  ConditionExpressionDefinitionChain,
  ConditionExpressionDefinitionChainTyped,
} from '../type/condition-expression-definition-chain'

/**
 * Use this method when accessing a top level attribute of a model with strict typing of the value in chained function
 * @example
 * ```typescript
 *
 * @Model()
 * class Person{
 *
 *   @PartitionKey()
 *   id: string
 *   age: number
 * }
 *
 * store
 *  .scan()
 *  .where(attribute2(Person, 'age').equals(5))
 *  .exec()
 * ```
 *
 * When using the attribute2 we have type support for the equals (and all other condition functions) value,
 * it can only be number, because the type of age is number too, this only works when not using a custom mapper.
 * The downside of the strict typing is the model constructor parameter which is only required for typing reasons
 */
export function attribute2<T, K extends keyof T>(
  _modelConstructor: ModelConstructor<T>,
  attributePath: K,
): ConditionExpressionDefinitionChainTyped<T, K> {
  return propertyDefinitionFunction<T, K>(attributePath)
}

/**
 * Use this method when accessing a top level attribute of a model to have type checking of the attributePath
 * @example
 * ```typescript
 * attribute('myProp').eq('foo')
 * ```
 */
export function attribute<T>(attributePath: keyof T): ConditionExpressionDefinitionChain

/**
 * Use this method when accessing a nested attribute of a model
 */
export function attribute(attributePath: string): ConditionExpressionDefinitionChain

export function attribute<T>(attributePath: keyof T): ConditionExpressionDefinitionChain {
  return propertyDefinitionFunction<T>(attributePath)
}
