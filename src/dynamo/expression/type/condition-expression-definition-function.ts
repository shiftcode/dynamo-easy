import { Metadata } from '../../../decorator/metadata/metadata'
import { ConditionExpression } from './condition-expression.type'

export type ConditionExpressionDefinitionFunction = (
  expressionAttributeValues: string[] | undefined,
  metadata: Metadata<any> | undefined
) => ConditionExpression
