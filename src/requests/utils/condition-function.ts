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
