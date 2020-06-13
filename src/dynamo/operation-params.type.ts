/**
 * @module dynamo-easy
 */
import * as DynamoDB from 'aws-sdk/clients/dynamodb'

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
  [key: string]: any
  expressionAttributeNames?: DynamoDB.ExpressionAttributeNameMap
  expressionAttributeValues?: DynamoDB.ExpressionAttributeValueMap
}

/**
 * @hidden
 */
export interface UpdateParamsHost {
  readonly params: DynamoDB.UpdateItemInput | DynamoDB.Update
}
