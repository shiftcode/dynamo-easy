import { Metadata } from '../../../decorator/metadata/metadata'
import { ConditionExpressionDefinitionFunction } from '../type/condition-expression-definition-function'
import { Expression } from '../type/expression.type'
import { mergeConditions } from './merge-conditions.function'

export function not(
  conditionDefinitionFn: ConditionExpressionDefinitionFunction
): ConditionExpressionDefinitionFunction {
  return (expressionAttributeValues: string[] | undefined, metadata: Metadata<any> | undefined): Expression => {
    const condition = conditionDefinitionFn(expressionAttributeValues, metadata)
    condition.statement = `NOT ${condition.statement}`
    return condition
  }
}
