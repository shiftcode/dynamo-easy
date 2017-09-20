import { Condition } from '../type/condition.type'

export function not(condition: Condition): Condition {
  condition.statement = `NOT ${condition.statement}`
  return condition
}
