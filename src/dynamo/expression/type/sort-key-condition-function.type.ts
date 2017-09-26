import { ConditionExpression } from './condition-expression.type'

export interface SortKeyConditionFunction {
  // LOW TODO narrow typing when possible -> https://github.com/Microsoft/TypeScript/issues/13573
  // [key in OperatorAlias]: (...value: any[]) => R;
  [key: string]: (...value: any[]) => ConditionExpression
  equals: (value: any) => ConditionExpression
  eq: (value: any) => ConditionExpression
  lt: (value: any) => ConditionExpression
  lte: (value: any) => ConditionExpression
  gt: (value: any) => ConditionExpression
  gte: (value: any) => ConditionExpression
  between: (value1: any, value2: any) => ConditionExpression
  beginsWith: (value: any) => ConditionExpression
}
