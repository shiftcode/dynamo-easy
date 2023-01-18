/**
 * @module expression
 */
import { ExtractListType } from '../../../helper/extract-list-type.type'
import { AttributeType } from '../../../mapper/type/attribute-type.type'
import { ConditionalParamsHost } from '../../operation-params.type'
import { ConditionExpressionDefinitionFunction } from './condition-expression-definition-function'

/**
 * see https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_Condition.html for full documentation
 */
interface ConditionFunctions<T, R> {
  equals: (value: T) => R
  eq: (value: T) => R
  ne: (value: T) => R
  lte: (value: T) => R
  lt: (value: T) => R
  gte: (value: T) => R
  gt: (value: T) => R
  null: () => R
  notNull: () => R
  contains: (value: T | ExtractListType<T>) => R
  notContains: (value: T | ExtractListType<T>) => R
  type: (value: AttributeType) => R
  in: (value: T[]) => R
  beginsWith: (value: T) => R
  between: (value1: T, value2: T) => R
  attributeExists: () => R
  attributeNotExists: () => R
}

export type ConditionExpressionDefinitionChain = ConditionFunctions<any, ConditionExpressionDefinitionFunction>

export type ConditionExpressionDefinitionChainTyped<T, K extends keyof T> = ConditionFunctions<
  T[K],
  ConditionExpressionDefinitionFunction
>

export type RequestConditionFunctionTyped<R extends ConditionalParamsHost, T, K extends keyof T> = ConditionFunctions<
  T[K],
  R
>
// TODO typings check on unused generic
export type RequestConditionFunction<R extends ConditionalParamsHost, _T> = ConditionFunctions<any, R>
