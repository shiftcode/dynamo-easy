import { Expression } from './expression.type'

export interface SortKeyConditionFunction {
  // TODO LOW:TYPINGS narrow typing when possible -> https://github.com/Microsoft/TypeScript/issues/13573
  // [key in OperatorAlias]: (...value: any[]) => R;
  [key: string]: (...value: any[]) => Expression
  equals: (value: any) => Expression
  eq: (value: any) => Expression
  lt: (value: any) => Expression
  lte: (value: any) => Expression
  gt: (value: any) => Expression
  gte: (value: any) => Expression
  between: (value1: any, value2: any) => Expression
  beginsWith: (value: any) => Expression
}
