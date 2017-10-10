import { Metadata } from '../../../decorator/metadata/metadata'
import { Expression } from './expression.type'
import { UpdateExpression } from './update-expression.type'

export type UpdateExpressionDefinitionFunction = (
  expressionAttributeValues: string[] | undefined,
  metadata: Metadata<any> | undefined
) => UpdateExpression
