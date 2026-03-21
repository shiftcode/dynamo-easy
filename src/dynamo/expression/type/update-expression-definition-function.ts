/**
 * @module expression
 */
import { Metadata } from '../../../decorator/metadata/metadata'
import { UpdateExpression } from './update-expression.type'

/**
 * @hidden
 */
export type UpdateExpressionDefinitionFunction = (
  expressionAttributeValues: Record<string, string> | undefined,
  metadata: Metadata<any> | undefined,
) => UpdateExpression
