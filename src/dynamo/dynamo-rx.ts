import * as AWS from "aws-sdk"
import * as DynamoDB from "aws-sdk/clients/dynamodb"
import {
  BatchGetItemInput,
  BatchGetItemOutput,
  BatchWriteItemInput,
  BatchWriteItemOutput,
  DeleteItemInput,
  DeleteItemOutput,
  PutItemInput,
  PutItemOutput,
  QueryInput,
  QueryOutput,
  ScanInput,
  ScanOutput,
  UpdateItemInput,
  UpdateItemOutput,
} from "aws-sdk/clients/dynamodb"
import { Observable } from "rxjs/Observable"

/**
 * Simply brings the standard dynamodb operations into the rx world by wrapping the node callbacks into observables
 */
export class DynamoRx {
  readonly dynamoDb: DynamoDB
  private readonly logger: Logger

  constructor() {
    // this.logger = new Logger(() => LogLevel.DEBUG, 'DynamoDbService');

    // create the actual dynamo db client
    this.dynamoDb = new AWS.DynamoDB()
  }

  updateAwsConfigCredentials(newConfig: AWS.Config): void {
    this.dynamoDb.config.update({ credentials: newConfig.credentials })
  }

  /*
   * make all the dynamo requests return an observable
   */
  putItem(params: PutItemInput): Observable<PutItemOutput> {
    return Observable.fromPromise(this.dynamoDb.putItem(params).promise())
  }

  updateItem(params: UpdateItemInput): Observable<UpdateItemOutput> {
    return Observable.fromPromise(this.dynamoDb.updateItem(params).promise())
  }

  deleteItem(params: DeleteItemInput): Observable<DeleteItemOutput> {
    return Observable.fromPromise(this.dynamoDb.deleteItem(params).promise())
  }

  batchWriteItem(
    params: BatchWriteItemInput
  ): Observable<BatchWriteItemOutput> {
    return Observable.fromPromise(
      this.dynamoDb.batchWriteItem(params).promise()
    )
  }

  batchGetItems(params: BatchGetItemInput): Observable<BatchGetItemOutput> {
    return Observable.fromPromise(this.dynamoDb.batchGetItem(params).promise())
  }

  scan(params: ScanInput): Observable<ScanOutput> {
    return Observable.fromPromise(this.dynamoDb.scan(params).promise())
  }

  query(params: QueryInput): Observable<QueryOutput> {
    if (!params.KeyConditionExpression) {
      throw new Error("key condition expression must be defined")
    }

    return Observable.fromPromise(this.dynamoDb.query(params).promise())
  }

  makeRequest(operation: string, params?: { [key: string]: any }): any {
    return Observable.fromPromise(
      this.dynamoDb.makeRequest(operation, params).promise()
    )
  }
}
