/**
 * @module dynamo-easy
 */
import * as DynamoDB from '@aws-sdk/client-dynamodb'

/**
 * Thin wrapper around the standard dynamoDB operations used by dynamo-easy
 * @hidden
 */
export class DynamoDbWrapper {
  constructor(readonly dynamoDB: DynamoDB.DynamoDB) {}

  /*
   * make all the dynamo requests return an promise
   */
  putItem(params: DynamoDB.PutItemInput): Promise<DynamoDB.PutItemOutput> {
    return this.dynamoDB.putItem(params)
  }

  getItem(params: DynamoDB.GetItemInput): Promise<DynamoDB.GetItemOutput> {
    return this.dynamoDB.getItem(params)
  }

  updateItem(params: DynamoDB.UpdateItemInput): Promise<DynamoDB.UpdateItemOutput> {
    return this.dynamoDB.updateItem(params)
  }

  deleteItem(params: DynamoDB.DeleteItemInput): Promise<DynamoDB.DeleteItemOutput> {
    return this.dynamoDB.deleteItem(params)
  }

  batchWriteItem(params: DynamoDB.BatchWriteItemInput): Promise<DynamoDB.BatchWriteItemOutput> {
    return this.dynamoDB.batchWriteItem(params)
  }

  batchGetItems(params: DynamoDB.BatchGetItemInput): Promise<DynamoDB.BatchGetItemOutput> {
    return this.dynamoDB.batchGetItem(params)
  }

  transactWriteItems(params: DynamoDB.TransactWriteItemsInput): Promise<DynamoDB.TransactWriteItemsOutput> {
    return this.dynamoDB.transactWriteItems(params)
  }

  transactGetItems(params: DynamoDB.TransactGetItemsInput): Promise<DynamoDB.TransactGetItemsOutput> {
    return this.dynamoDB.transactGetItems(params)
  }

  scan(params: DynamoDB.ScanInput): Promise<DynamoDB.ScanOutput> {
    return this.dynamoDB.scan(params)
  }

  query(params: DynamoDB.QueryInput): Promise<DynamoDB.QueryOutput> {
    if (!params.KeyConditionExpression) {
      throw new Error('key condition expression must be defined')
    }

    return this.dynamoDB.query(params)
  }
}
