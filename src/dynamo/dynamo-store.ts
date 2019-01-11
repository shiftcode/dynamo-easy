import * as DynamoDB from 'aws-sdk/clients/dynamodb'
import { Observable } from 'rxjs'
import { tap } from 'rxjs/operators'
import { createLogger, Logger } from '../logger/logger'
import { ModelConstructor } from '../model'
import { DynamoApiOperations } from './dynamo-api-operations.type'
import { DynamoRx } from './dynamo-rx'
import { getTableName } from './get-table-name.function'
import {
  BatchGetSingleTableRequest,
  DeleteRequest,
  GetRequest,
  PutRequest,
  QueryRequest,
  ScanRequest,
  TransactGetSingleTableRequest,
  UpdateRequest,
} from './request'
import { BatchWriteSingleTableRequest } from './request/batchwritesingletable/batch-write-single-table.request'

export class DynamoStore<T> {
  get dynamoDB(): DynamoDB {
    return this.dynamoRx.dynamoDB
  }

  readonly tableName: string
  private readonly logger: Logger
  private readonly dynamoRx: DynamoRx

  constructor(private modelClazz: ModelConstructor<T>) {
    this.logger = createLogger('dynamo.DynamoStore', modelClazz)
    this.dynamoRx = new DynamoRx()
    this.tableName = getTableName(modelClazz)
    this.logger.debug('instance created')
  }

  put(item: T): PutRequest<T> {
    return new PutRequest(this.dynamoRx, this.modelClazz, item)
  }

  get(partitionKey: any, sortKey?: any): GetRequest<T> {
    return new GetRequest<T>(this.dynamoRx, this.modelClazz, partitionKey, sortKey)
  }

  update(partitionKey: any, sortKey?: any): UpdateRequest<T> {
    return new UpdateRequest(this.dynamoRx, this.modelClazz, partitionKey, sortKey)
  }

  delete(partitionKey: any, sortKey?: any): DeleteRequest<T> {
    return new DeleteRequest(this.dynamoRx, this.modelClazz, partitionKey, sortKey)
  }

  scan(): ScanRequest<T> {
    return new ScanRequest<T>(this.dynamoRx, this.modelClazz)
  }

  query(): QueryRequest<T> {
    return new QueryRequest(this.dynamoRx, this.modelClazz)
  }

  /**
   * This is a special implementation of BatchGetItem request, because it only supports one table,
   * if you wish to retrieve items from multiple tables
   * create an instance of BatchGetItemInput and use store.makeRequest with it.
   */
  batchGet(keys: Array<Partial<T>>): BatchGetSingleTableRequest<T> {
    return new BatchGetSingleTableRequest(this.dynamoRx, this.modelClazz, keys)
  }

  /**
   * This is a special implementation of batchWriteItem request, because it only supports one table,
   * if you wish to write items to multiple tables
   * create an instance of BatchWriteItemInput and use store.makeRequest with it.
   */
  batchWrite(): BatchWriteSingleTableRequest<T> {
    return new BatchWriteSingleTableRequest<T>(this.dynamoRx, this.modelClazz)
  }

  transactGet(keys: Array<Partial<T>>): TransactGetSingleTableRequest<T> {
    return new TransactGetSingleTableRequest(this.dynamoRx, this.modelClazz, keys)
  }

  makeRequest<Z>(operation: DynamoApiOperations, params?: Record<string, any>): Observable<Z> {
    this.logger.debug('request', params)
    return this.dynamoRx.makeRequest(operation, params).pipe(tap(response => this.logger.debug('response', response)))
  }
}
