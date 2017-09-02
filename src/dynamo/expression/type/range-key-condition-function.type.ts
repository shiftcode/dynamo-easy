import { Condition } from './condition.type'

export interface RangeKeyConditionFunction {
  // TODO narrow typing when possible -> https://github.com/Microsoft/TypeScript/issues/13573
  // [key in OperatorAlias]: (...value: any[]) => R;
  [key: string]: (...value: any[]) => Condition
  equals: (value: any) => Condition
  eq: (value: any) => Condition
  lt: (value: any) => Condition
  lte: (value: any) => Condition
  gt: (value: any) => Condition
  gte: (value: any) => Condition
  between: (value1: any, value2: any) => Condition
  beginsWith: (value: any) => Condition
}
