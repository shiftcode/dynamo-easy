import { Config } from 'aws-sdk'
import * as DynamoDB from 'aws-sdk/clients/dynamodb'
import { from, Observable } from 'rxjs'
import { switchMap } from 'rxjs/operators'
import { dynamoEasyConfig } from '../config/dynamo-easy-config'

/**
 * Simply brings the standard dynamodb operations into the rx world by wrapping the node callbacks into observables
 */
export class DynamoRx {
  readonly dynamoDb: DynamoDB

  constructor(awsRegion?: string) {
    // create the actual dynamo db client
    this.dynamoDb = new DynamoDB()
  }

  updateAwsConfigCredentials(newConfig: Config): void {
    this.dynamoDb.config.update({ credentials: newConfig.credentials })
  }

  /*
   * make all the dynamo requests return an observable
   */
  putItem(params: DynamoDB.PutItemInput): Observable<DynamoDB.PutItemOutput> {
    return dynamoEasyConfig.sessionValidityEnsurer()
      .pipe(switchMap(() => from(this.dynamoDb.putItem(params).promise())))
  }

  getItem(params: DynamoDB.GetItemInput): Observable<DynamoDB.GetItemOutput> {
    return dynamoEasyConfig.sessionValidityEnsurer()
      .pipe(switchMap(() => from(this.dynamoDb.getItem(params).promise())))
  }

  updateItem(params: DynamoDB.UpdateItemInput): Observable<DynamoDB.UpdateItemOutput> {
    return dynamoEasyConfig.sessionValidityEnsurer()
      .pipe(switchMap(() => from(this.dynamoDb.updateItem(params).promise())))
  }

  deleteItem(params: DynamoDB.DeleteItemInput): Observable<DynamoDB.DeleteItemOutput> {
    return dynamoEasyConfig.sessionValidityEnsurer()
      .pipe(switchMap(() => from(this.dynamoDb.deleteItem(params).promise())))
  }

  batchWriteItem(params: DynamoDB.BatchWriteItemInput): Observable<DynamoDB.BatchWriteItemOutput> {
    return dynamoEasyConfig.sessionValidityEnsurer()
      .pipe(switchMap(() => from(this.dynamoDb.batchWriteItem(params).promise())))
  }

  batchGetItems(params: DynamoDB.BatchGetItemInput): Observable<DynamoDB.BatchGetItemOutput> {
    return dynamoEasyConfig.sessionValidityEnsurer()
      .pipe(switchMap(() => from(this.dynamoDb.batchGetItem(params).promise())))
  }

  transactWriteItems(params: DynamoDB.TransactWriteItemsInput): Observable<DynamoDB.TransactWriteItemsOutput> {
    return dynamoEasyConfig.sessionValidityEnsurer()
      .pipe(switchMap(() => from(this.dynamoDb.transactWriteItems(params).promise())))
  }

  transactGetItems(params: DynamoDB.TransactGetItemsInput): Observable<DynamoDB.TransactGetItemsOutput> {
    return dynamoEasyConfig.sessionValidityEnsurer()
      .pipe(switchMap(() => from(this.dynamoDb.transactGetItems(params).promise())))
  }

  scan(params: DynamoDB.ScanInput): Observable<DynamoDB.ScanOutput> {
    return dynamoEasyConfig.sessionValidityEnsurer()
      .pipe(switchMap(() => from(this.dynamoDb.scan(params).promise())))
  }

  query(params: DynamoDB.QueryInput): Observable<DynamoDB.QueryOutput> {
    if (!params.KeyConditionExpression) {
      throw new Error('key condition expression must be defined')
    }

    return dynamoEasyConfig.sessionValidityEnsurer()
      .pipe(switchMap(() => from(this.dynamoDb.query(params).promise())))
  }

  makeRequest(operation: string, params?: Record<string, any>): Observable<any> {
    return dynamoEasyConfig.sessionValidityEnsurer()
      .pipe(switchMap(() => from(this.dynamoDb.makeRequest(operation, params).promise())),
      )
  }
}
