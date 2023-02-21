/**
 * @module dynamo-easy
 */
import * as DynamoDB from '@aws-sdk/client-dynamodb'
import * as DynamoDBv2 from '../aws-sdk-v2.types'

/**
 * @hidden
 */
export interface ConditionalParamsHost {
  readonly params: ConditionalParams
}

/**
 * @hidden
 */
export interface ConditionalParams {
  expressionAttributeNames?: DynamoDBv2.ExpressionAttributeNameMap
  expressionAttributeValues?: DynamoDBv2.ExpressionAttributeValueMap
  [key: string]: any
}

/**
 * @hidden
 */
export interface UpdateParamsHost {
  readonly params: DynamoDB.UpdateItemInput | DynamoDB.Update
}
