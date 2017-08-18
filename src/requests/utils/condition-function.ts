import { Request } from '../request.model'
import { Condition } from './condition.model'

export interface ConditionFunction<T extends Request<any, any>> {
  equals: (value: any) => T
  eq: (value: any) => T
  ne: (value: any) => T
  lte: (value: any) => T
  lt: (value: any) => T
  gte: (value: any) => T
  gt: (value: any) => T
  null: () => T
  notNull: () => T
  contains: (value: any) => T
  notContains: (value: any) => T
  in: (value: any[]) => T
  beginsWith: (value: any) => T
  between: (value1: any, value2: any) => T
}

export interface ConditionFunctionA {
  equals: (value: any) => Condition
  eq: (value: any) => Condition
  ne: (value: any) => Condition
  lte: (value: any) => Condition
  lt: (value: any) => Condition
  gte: (value: any) => Condition
  gt: (value: any) => Condition
  null: () => Condition
  notNull: () => Condition
  contains: (value: any) => Condition
  notContains: (value: any) => Condition
  in: (value: any[]) => Condition
  beginsWith: (value: any) => Condition
  between: (value1: any, value2: any) => Condition
}
