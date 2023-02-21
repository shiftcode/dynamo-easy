import * as DynamoDB from '@aws-sdk/client-dynamodb'
import { Metadata } from '../../../decorator/metadata/metadata'
import { resolveAttributeNames } from '../../expression/functions/attribute-names.function'

/**
 * Adds ProjectionExpression param and expressionAttributeNames to the params object
 */
export function addProjectionExpressionParam<T>(
  attributesToGet: Array<keyof T | string>,
  params: DynamoDB.QueryInput | DynamoDB.ScanInput | DynamoDB.GetItemInput | DynamoDB.KeysAndAttributes,
  metadata?: Metadata<T>,
): void {
  const resolved = attributesToGet.map((attributeToGet) => resolveAttributeNames(<string>attributeToGet, metadata))
  params.ProjectionExpression = resolved.map((attr) => attr.placeholder).join(', ')
  resolved.forEach((r) => {
    params.ExpressionAttributeNames = { ...params.ExpressionAttributeNames, ...r.attributeNames }
  })
}
