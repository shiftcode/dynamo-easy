import * as DynamoDB from 'aws-sdk/clients/dynamodb'
import { Attributes } from '../../mapper'


export interface DeleteOperationParams<T> extends WriteOperationParams {
  Key: Attributes<Partial<T>>;
}

export interface PutOperationParams<T> extends WriteOperationParams {
  Item: Attributes<T>;
}

export interface UpdateOperationParams<T> extends WriteOperationParams {
  Key: Attributes<Partial<T>>;
  UpdateExpression: string
}

export interface WriteOperationParams {
  TableName: string
  ConditionExpression?: DynamoDB.ConditionExpression
  ExpressionAttributeNames?: DynamoDB.ExpressionAttributeNameMap
  ExpressionAttributeValues?: DynamoDB.ExpressionAttributeValueMap
}
