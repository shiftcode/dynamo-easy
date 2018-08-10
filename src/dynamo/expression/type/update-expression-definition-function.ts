import { Metadata } from '../../../decorator/metadata/metadata'
import { UpdateExpression } from './update-expression.type'

export type UpdateExpressionDefinitionFunction = (
  expressionAttributeValues: string[] | undefined,
  metadata: Metadata<any> | undefined
) => UpdateExpression
