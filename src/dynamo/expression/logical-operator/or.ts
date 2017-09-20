import { Condition } from '../type/condition.type'
import { mergeConditions } from './util'

export function or(...conditions: Condition[]): Condition {
  return mergeConditions('OR', conditions)
}
