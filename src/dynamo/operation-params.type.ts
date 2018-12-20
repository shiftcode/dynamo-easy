import * as DynamoDB from 'aws-sdk/clients/dynamodb'

export interface ConditionalParamsHost {
  readonly params: ConditionalParams
}

export interface ConditionalParams {
  expressionAttributeNames?: DynamoDB.ExpressionAttributeNameMap
  expressionAttributeValues?: DynamoDB.ExpressionAttributeValueMap
  [key: string]: any
}


export interface UpdateParamsHost {
  readonly params: DynamoDB.UpdateItemInput | DynamoDB.Update
}
