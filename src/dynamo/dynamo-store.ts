/**
 * @module dynamo-easy
 */
import * as DynamoDB from '@aws-sdk/client-dynamodb'
import { createLogger, Logger } from '../logger/logger'
import { ModelConstructor } from '../model/model-constructor'
import { getTableName } from './get-table-name.function'
import { BatchGetSingleTableRequest } from './request/batchgetsingletable/batch-get-single-table.request'
import { BatchWriteSingleTableRequest } from './request/batchwritesingletable/batch-write-single-table.request'
import { DeleteRequest } from './request/delete/delete.request'
import { GetRequest } from './request/get/get.request'
import { PutRequest } from './request/put/put.request'
import { QueryRequest } from './request/query/query.request'
import { ScanRequest } from './request/scan/scan.request'
import { TransactGetSingleTableRequest } from './request/transactgetsingletable/transact-get-single-table.request'
import { UpdateRequest } from './request/update/update.request'

/**
 * DynamoStore
 */
export class DynamoStore<T> {
  readonly tableName: string
  private readonly logger: Logger

  constructor(
    private modelClazz: ModelConstructor<T>,
    readonly client: DynamoDB.DynamoDBClient,
  ) {
    this.logger = createLogger('dynamo.DynamoStore', modelClazz)
    this.tableName = getTableName(modelClazz)
    this.logger.debug('instance created')
  }

  put(item: T): PutRequest<T> {
    return new PutRequest(this.client, this.modelClazz, item)
  }

  get(partitionKey: any, sortKey?: any): GetRequest<T> {
    return new GetRequest<T>(this.client, this.modelClazz, partitionKey, sortKey)
  }

  update(partitionKey: any, sortKey?: any): UpdateRequest<T> {
    return new UpdateRequest(this.client, this.modelClazz, partitionKey, sortKey)
  }

  delete(partitionKey: any, sortKey?: any): DeleteRequest<T> {
    return new DeleteRequest(this.client, this.modelClazz, partitionKey, sortKey)
  }

  scan(): ScanRequest<T> {
    return new ScanRequest<T>(this.client, this.modelClazz)
  }

  query(): QueryRequest<T> {
    return new QueryRequest(this.client, this.modelClazz)
  }

  /**
   * This is a special implementation of BatchGetItem request, because it only supports one table,
   * if you wish to retrieve items from multiple tables
   * create an instance of BatchGetItemInput and use store.makeRequest with it.
   */
  batchGet(keys: Array<Partial<T>>): BatchGetSingleTableRequest<T> {
    return new BatchGetSingleTableRequest(this.client, this.modelClazz, keys)
  }

  /**
   * This is a special implementation of batchWriteItem request, because it only supports one table,
   * if you wish to write items to multiple tables
   * create an instance of BatchWriteItemInput and use store.makeRequest with it.
   */
  batchWrite(): BatchWriteSingleTableRequest<T> {
    return new BatchWriteSingleTableRequest<T>(this.client, this.modelClazz)
  }

  transactGet(keys: Array<Partial<T>>): TransactGetSingleTableRequest<T> {
    return new TransactGetSingleTableRequest(this.client, this.modelClazz, keys)
  }
}
