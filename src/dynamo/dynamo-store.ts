import * as DynamoDB from 'aws-sdk/clients/dynamodb'
import { Observable } from 'rxjs'
import { MetadataHelper } from '../decorator/metadata/metadata-helper'
import { Mapper } from '../mapper/mapper'
import { ModelConstructor } from '../model/model-constructor'
import { DEFAULT_SESSION_VALIDITY_ENSURER } from './default-session-validity-ensurer.const'
import { DEFAULT_TABLE_NAME_RESOLVER } from './default-table-name-resolver.const'
import { DynamoApiOperations } from './dynamo-api-operations.type'
import { DynamoRx } from './dynamo-rx'
import { BatchGetSingleTableRequest } from './request/batchgetsingletable/batch-get-single-table.request'
import { DeleteRequest } from './request/delete/delete.request'
import { GetRequest } from './request/get/get.request'
import { PutRequest } from './request/put/put.request'
import { QueryRequest } from './request/query/query.request'
import { REGEX_TABLE_NAME } from './request/regex'
import { ScanRequest } from './request/scan/scan.request'
import { UpdateRequest } from './request/update/update.request'
import { SessionValidityEnsurer } from './session-validity-ensurer.type'
import { TableNameResolver } from './table-name-resolver.type'

export class DynamoStore<T> {
  private readonly dynamoRx: DynamoRx
  private readonly mapper: Mapper

  readonly tableName: string

  constructor(
    private modelClazz: ModelConstructor<T>,
    private tableNameResolver: TableNameResolver = DEFAULT_TABLE_NAME_RESOLVER,
    sessionValidityEnsurer: SessionValidityEnsurer = DEFAULT_SESSION_VALIDITY_ENSURER
  ) {
    this.dynamoRx = new DynamoRx(sessionValidityEnsurer)
    const tableName = tableNameResolver(MetadataHelper.get(this.modelClazz).modelOptions.tableName)
    if (!REGEX_TABLE_NAME.test(tableName)) {
      throw new Error(
        'make sure the table name only contains these characters «a-z A-Z 0-9 - _ .» and is between 3 and 255 characters long'
      )
    }

    this.tableName = tableName
  }

  get dynamoDb(): DynamoDB {
    return this.dynamoRx.dynamoDb
  }

  put(item: T): PutRequest<T> {
    return new PutRequest(this.dynamoRx, this.modelClazz, this.tableName, item)
  }

  get(partitionKey: any, sortKey?: any): GetRequest<T> {
    return new GetRequest<T>(this.dynamoRx, this.modelClazz, this.tableName, partitionKey, sortKey)
  }

  update(partitionKey: any, sortKey?: any): UpdateRequest<T> {
    return new UpdateRequest(this.dynamoRx, this.modelClazz, this.tableName, partitionKey, sortKey)
  }

  delete(partitionKey: any, sortKey?: any): DeleteRequest<T> {
    return new DeleteRequest(this.dynamoRx, this.modelClazz, this.tableName, partitionKey, sortKey)
  }

  scan(): ScanRequest<T> {
    return new ScanRequest<T>(this.dynamoRx, this.modelClazz, this.tableName)
  }

  query(): QueryRequest<T> {
    return new QueryRequest(this.dynamoRx, this.modelClazz, this.tableName)
  }

  /**
   * This is a special implementation of BatchGetItem request, because it only supports one table, if you wish to retrieve items from multiple tables
   * get an instance of BatchGetItem request and call it there.
   */
  batchGetItem(keys: any[]): BatchGetSingleTableRequest<T> {
    return new BatchGetSingleTableRequest(this.dynamoRx, this.modelClazz, this.tableName, keys)
  }

  makeRequest<Z>(operation: DynamoApiOperations, params?: { [key: string]: any }): Observable<Z> {
    return this.dynamoRx.makeRequest(operation, params)
  }

  private createBaseParams(): { TableName: string } {
    const params: { TableName: string } = {
      TableName: this.tableName,
    }

    return params
  }
}
