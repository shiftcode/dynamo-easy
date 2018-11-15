import { Config } from 'aws-sdk'
import * as DynamoDB from 'aws-sdk/clients/dynamodb'
import { from, Observable } from 'rxjs'
import { switchMap } from 'rxjs/operators'
import { SessionValidityEnsurer } from './session-validity-ensurer.type'

/**
 * Simply brings the standard dynamodb operations into the rx world by wrapping the node callbacks into observables
 */
export class DynamoRx {
  readonly dynamoDb: DynamoDB
  readonly sessionValidityEnsurer: SessionValidityEnsurer

  constructor(sessionValidityEnsurer: SessionValidityEnsurer, awsRegion?: string) {
    // this.logger = new Logger(() => LogLevel.DEBUG, 'DynamoDbService');

    // create the actual dynamo db client
    this.dynamoDb = new DynamoDB()
    this.sessionValidityEnsurer = sessionValidityEnsurer
  }

  updateAwsConfigCredentials(newConfig: Config): void {
    this.dynamoDb.config.update({ credentials: newConfig.credentials })
  }

  /*
   * make all the dynamo requests return an observable
   */
  putItem(params: DynamoDB.PutItemInput): Observable<DynamoDB.PutItemOutput> {
    return this.sessionValidityEnsurer().pipe(switchMap(() => from(this.dynamoDb.putItem(params).promise())))
  }

  getItem(params: DynamoDB.GetItemInput): Observable<DynamoDB.GetItemOutput> {
    return this.sessionValidityEnsurer().pipe(switchMap(() => from(this.dynamoDb.getItem(params).promise())))
  }

  updateItem(params: DynamoDB.UpdateItemInput): Observable<DynamoDB.UpdateItemOutput> {
    return this.sessionValidityEnsurer().pipe(switchMap(() => from(this.dynamoDb.updateItem(params).promise())))
  }

  deleteItem(params: DynamoDB.DeleteItemInput): Observable<DynamoDB.DeleteItemOutput> {
    return this.sessionValidityEnsurer().pipe(switchMap(() => from(this.dynamoDb.deleteItem(params).promise())))
  }

  batchWriteItem(params: DynamoDB.BatchWriteItemInput): Observable<DynamoDB.BatchWriteItemOutput> {
    return this.sessionValidityEnsurer().pipe(switchMap(() => from(this.dynamoDb.batchWriteItem(params).promise())))
  }

  batchGetItems(params: DynamoDB.BatchGetItemInput): Observable<DynamoDB.BatchGetItemOutput> {
    return this.sessionValidityEnsurer().pipe(switchMap(() => from(this.dynamoDb.batchGetItem(params).promise())))
  }

  scan(params: DynamoDB.ScanInput): Observable<DynamoDB.ScanOutput> {
    return this.sessionValidityEnsurer().pipe(switchMap(() => from(this.dynamoDb.scan(params).promise())))
  }

  query(params: DynamoDB.QueryInput): Observable<DynamoDB.QueryOutput> {
    if (!params.KeyConditionExpression) {
      throw new Error('key condition expression must be defined')
    }

    return this.sessionValidityEnsurer().pipe(switchMap(() => from(this.dynamoDb.query(params).promise())))
  }

  makeRequest(operation: string, params?: { [key: string]: any }): Observable<any> {
    return this.sessionValidityEnsurer().pipe(
      switchMap(() => from(this.dynamoDb.makeRequest(operation, params).promise()))
    )
  }
}
