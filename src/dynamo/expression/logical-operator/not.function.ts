import { ConditionExpression } from '../type/condition-expression.type'

export function not(condition: ConditionExpression): ConditionExpression {
  condition.statement = `NOT ${condition.statement}`
  return condition
}
