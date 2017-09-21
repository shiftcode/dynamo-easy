import { AttributeType } from '../../../mapper/type/attribute.type'
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
}
