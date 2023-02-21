/**
 * @module dynamo-easy
 */
import * as DynamoDB from '@aws-sdk/client-dynamodb'
import { dynamoEasyConfig } from '../config/dynamo-easy-config'

/**
 * Simply calls the sessionValidityEnsurer before each standard dynamoDB operations and returns a promise for each
 * request
 * @hidden
 */
export class DynamoDbWrapper {
  constructor(readonly dynamoDB: DynamoDB.DynamoDB) {}

  /*
   * make all the dynamo requests return an promise
   */
  putItem(params: DynamoDB.PutItemInput): Promise<DynamoDB.PutItemOutput> {
    return dynamoEasyConfig.sessionValidityEnsurer().then(() => this.dynamoDB.putItem(params))
  }

  getItem(params: DynamoDB.GetItemInput): Promise<DynamoDB.GetItemOutput> {
    return dynamoEasyConfig.sessionValidityEnsurer().then(() => this.dynamoDB.getItem(params))
  }

  updateItem(params: DynamoDB.UpdateItemInput): Promise<DynamoDB.UpdateItemOutput> {
    return dynamoEasyConfig.sessionValidityEnsurer().then(() => this.dynamoDB.updateItem(params))
  }

  deleteItem(params: DynamoDB.DeleteItemInput): Promise<DynamoDB.DeleteItemOutput> {
    return dynamoEasyConfig.sessionValidityEnsurer().then(() => this.dynamoDB.deleteItem(params))
  }

  batchWriteItem(params: DynamoDB.BatchWriteItemInput): Promise<DynamoDB.BatchWriteItemOutput> {
    return dynamoEasyConfig.sessionValidityEnsurer().then(() => this.dynamoDB.batchWriteItem(params))
  }

  batchGetItems(params: DynamoDB.BatchGetItemInput): Promise<DynamoDB.BatchGetItemOutput> {
    return dynamoEasyConfig.sessionValidityEnsurer().then(() => this.dynamoDB.batchGetItem(params))
  }

  transactWriteItems(params: DynamoDB.TransactWriteItemsInput): Promise<DynamoDB.TransactWriteItemsOutput> {
    return dynamoEasyConfig.sessionValidityEnsurer().then(() => this.dynamoDB.transactWriteItems(params))
  }

  transactGetItems(params: DynamoDB.TransactGetItemsInput): Promise<DynamoDB.TransactGetItemsOutput> {
    return dynamoEasyConfig.sessionValidityEnsurer().then(() => this.dynamoDB.transactGetItems(params))
  }

  scan(params: DynamoDB.ScanInput): Promise<DynamoDB.ScanOutput> {
    return dynamoEasyConfig.sessionValidityEnsurer().then(() => this.dynamoDB.scan(params))
  }

  query(params: DynamoDB.QueryInput): Promise<DynamoDB.QueryOutput> {
    if (!params.KeyConditionExpression) {
      throw new Error('key condition expression must be defined')
    }

    return dynamoEasyConfig.sessionValidityEnsurer().then(() => this.dynamoDB.query(params))
  }

  /*
   * TODO v3: check for replacement. DynamoDB.executeStatement is now used to execute statements using PartiQL
   */
  // makeRequest(operation: string, params?: Record<string, any>): Promise<any> {
  //   return dynamoEasyConfig.sessionValidityEnsurer().then(() => this.dynamoDB.executeStatement(operation as any, params))
  // }
}
