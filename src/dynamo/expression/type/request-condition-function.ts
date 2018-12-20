import { ExtractListType } from '../../../helper'
import { AttributeType } from '../../../mapper/type/attribute-type.type'
import { ConditionalParamsHost } from '../../operation-params.type'

export interface RequestConditionFunctionTyped<R extends ConditionalParamsHost, T, K extends keyof T> {
  equals: (value: T[K]) => R
  eq: (value: T[K]) => R
  ne: (value: T[K]) => R
  lte: (value: T[K]) => R
  lt: (value: T[K]) => R
  gte: (value: T[K]) => R
  gt: (value: T[K]) => R
  null: () => R
  notNull: () => R
  contains: (value: ExtractListType<T[K]>) => R
  notContains: (value: ExtractListType<T[K]>) => R
  type: (value: AttributeType) => R
  in: (value: Array<ExtractListType<T[K]>>) => R
  beginsWith: (value: T[K]) => R
  between: (value1: T[K], value2: T[K]) => R
}
