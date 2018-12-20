import { ExtractListType } from '../../../helper'
import { AttributeType } from '../../../mapper/type/attribute-type.type'
import { ConditionExpressionDefinitionFunction } from './condition-expression-definition-function'


export interface ConditionExpressionDefinitionChain {
  equals: (value: any) => ConditionExpressionDefinitionFunction
  eq: (value: any) => ConditionExpressionDefinitionFunction
  ne: (value: any) => ConditionExpressionDefinitionFunction
  lte: (value: any) => ConditionExpressionDefinitionFunction
  lt: (value: any) => ConditionExpressionDefinitionFunction
  gte: (value: any) => ConditionExpressionDefinitionFunction
  gt: (value: any) => ConditionExpressionDefinitionFunction
  null: () => ConditionExpressionDefinitionFunction
  notNull: () => ConditionExpressionDefinitionFunction
  contains: (value: any) => ConditionExpressionDefinitionFunction
  notContains: (value: any) => ConditionExpressionDefinitionFunction
  type: (value: AttributeType) => ConditionExpressionDefinitionFunction
  in: (value: any[]) => ConditionExpressionDefinitionFunction
  beginsWith: (value: any) => ConditionExpressionDefinitionFunction
  between: (value1: any, value2: any) => ConditionExpressionDefinitionFunction
  attributeExists: () => ConditionExpressionDefinitionFunction
  attributeNotExists: () => ConditionExpressionDefinitionFunction
}


export interface ConditionExpressionDefinitionChainTyped<T, K extends keyof T> {
  equals: (value: T[K]) => ConditionExpressionDefinitionFunction
  eq: (value: T[K]) => ConditionExpressionDefinitionFunction
  ne: (value: T[K]) => ConditionExpressionDefinitionFunction
  lte: (value: T[K]) => ConditionExpressionDefinitionFunction
  lt: (value: T[K]) => ConditionExpressionDefinitionFunction
  gte: (value: T[K]) => ConditionExpressionDefinitionFunction
  gt: (value: T[K]) => ConditionExpressionDefinitionFunction
  null: () => ConditionExpressionDefinitionFunction
  notNull: () => ConditionExpressionDefinitionFunction
  contains: (value: ExtractListType<T[K]>) => ConditionExpressionDefinitionFunction
  notContains: (value: ExtractListType<T[K]>) => ConditionExpressionDefinitionFunction
  type: (value: AttributeType) => ConditionExpressionDefinitionFunction
  in: (value: Array<T[K]>) => ConditionExpressionDefinitionFunction
  beginsWith: (value: T[K]) => ConditionExpressionDefinitionFunction
  between: (value1: T[K], value2: T[K]) => ConditionExpressionDefinitionFunction
  attributeExists: () => ConditionExpressionDefinitionFunction
  attributeNotExists: () => ConditionExpressionDefinitionFunction
}
