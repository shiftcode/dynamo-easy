/**
 * @module expression
 */
import { Metadata } from '../../../decorator/metadata/metadata'
import { Expression } from './expression.type'

/**
 * @hidden
 */
export type ConditionExpressionDefinitionFunction = (
  expressionAttributeValues: string[] | undefined,
  metadata: Metadata<any> | undefined,
) => Expression
