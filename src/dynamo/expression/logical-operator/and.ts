import { Condition } from '../type/condition.type'
import { mergeConditions } from './util'

export function and(...conditions: Condition[]): Condition {
  return mergeConditions('AND', conditions)
}
