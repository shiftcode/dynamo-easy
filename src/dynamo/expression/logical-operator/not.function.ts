import { Metadata } from '../../../decorator/metadata/metadata'
import { ConditionExpressionDefinitionFunction } from '../type/condition-expression-definition-function'
import { ConditionExpression } from '../type/condition-expression.type'
import { mergeConditions } from './merge-conditions.function'

export function not(
  conditionDefinitionFn: ConditionExpressionDefinitionFunction
): ConditionExpressionDefinitionFunction {
  return (
    expressionAttributeValues: string[] | undefined,
    metadata: Metadata<any> | undefined
  ): ConditionExpression => {
    const condition = conditionDefinitionFn(expressionAttributeValues, metadata)
    condition.statement = `NOT ${condition.statement}`
    return condition
  }
}
