import * as DynamoDB from 'aws-sdk/clients/dynamodb'
import { Config } from 'aws-sdk/global'
import { dynamoEasyConfig } from '../config/dynamo-easy-config'

/**
 * Simply calls the sessionValidityEnsurer before each standard dynamoDB operations and returns a promise for each
 * request
 */
export class DynamoPromisified {
  readonly dynamoDB: DynamoDB

  constructor() {
    // create the actual dynamo db client
    this.dynamoDB = new DynamoDB()
  }

  updateAwsConfigCredentials(newConfig: Config): void {
    this.dynamoDB.config.update({ credentials: newConfig.credentials })
  }

  /*
   * make all the dynamo requests return an promise
   */
  putItem(params: DynamoDB.PutItemInput): Promise<DynamoDB.PutItemOutput> {
    return dynamoEasyConfig.sessionValidityEnsurer()
      .then(() => this.dynamoDB.putItem(params).promise())
  }

  getItem(params: DynamoDB.GetItemInput): Promise<DynamoDB.GetItemOutput> {
    return dynamoEasyConfig.sessionValidityEnsurer()
      .then(() => this.dynamoDB.getItem(params).promise())
  }

  updateItem(params: DynamoDB.UpdateItemInput): Promise<DynamoDB.UpdateItemOutput> {
    return dynamoEasyConfig.sessionValidityEnsurer()
      .then(() => this.dynamoDB.updateItem(params).promise())
  }

  deleteItem(params: DynamoDB.DeleteItemInput): Promise<DynamoDB.DeleteItemOutput> {
    return dynamoEasyConfig.sessionValidityEnsurer()
      .then(() => this.dynamoDB.deleteItem(params).promise())
  }

  batchWriteItem(params: DynamoDB.BatchWriteItemInput): Promise<DynamoDB.BatchWriteItemOutput> {
    return dynamoEasyConfig.sessionValidityEnsurer()
      .then(() => this.dynamoDB.batchWriteItem(params).promise())
  }

  batchGetItems(params: DynamoDB.BatchGetItemInput): Promise<DynamoDB.BatchGetItemOutput> {
    return dynamoEasyConfig.sessionValidityEnsurer()
      .then(() => this.dynamoDB.batchGetItem(params).promise())
  }

  transactWriteItems(params: DynamoDB.TransactWriteItemsInput): Promise<DynamoDB.TransactWriteItemsOutput> {
    return dynamoEasyConfig.sessionValidityEnsurer()
      .then(() => this.dynamoDB.transactWriteItems(params).promise())
  }

  transactGetItems(params: DynamoDB.TransactGetItemsInput): Promise<DynamoDB.TransactGetItemsOutput> {
    return dynamoEasyConfig.sessionValidityEnsurer()
      .then(() => this.dynamoDB.transactGetItems(params).promise())
  }

  scan(params: DynamoDB.ScanInput): Promise<DynamoDB.ScanOutput> {
    return dynamoEasyConfig.sessionValidityEnsurer()
      .then(() => this.dynamoDB.scan(params).promise())
  }

  query(params: DynamoDB.QueryInput): Promise<DynamoDB.QueryOutput> {
    if (!params.KeyConditionExpression) {
      throw new Error('key condition expression must be defined')
    }

    return dynamoEasyConfig.sessionValidityEnsurer()
      .then(() => this.dynamoDB.query(params).promise())
  }

  makeRequest(operation: string, params?: Record<string, any>): Promise<any> {
    return dynamoEasyConfig.sessionValidityEnsurer()
      .then(() => this.dynamoDB.makeRequest(operation, params).promise())
  }
}
