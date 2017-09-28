import * as DynamoDB from 'aws-sdk/clients/dynamodb'
import { Observable } from 'rxjs/Observable'
import { MetadataHelper } from '../decorator/metadata/metadata-helper'
import { Mapper } from '../mapper/mapper'
import { ModelConstructor } from '../model/model-constructor'
import { DEFAULT_SESSION_VALIDITY_ENSURERE } from './default-session-validity-ensurer.const'
import { DEFAULT_TABLE_NAME_RESOLVER } from './default-table-name-resolver.const'
import { DynamoRx } from './dynamo-rx'
import { DeleteRequest } from './request/delete/delete.request'
import { GetRequest } from './request/get/get.request'
import { PutRequest } from './request/put/put.request'
import { QueryRequest } from './request/query/query.request'
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
    tableNameResolver: TableNameResolver = DEFAULT_TABLE_NAME_RESOLVER,
    sessionValidityEnsurer: SessionValidityEnsurer = DEFAULT_SESSION_VALIDITY_ENSURERE
  ) {
    this.dynamoRx = new DynamoRx(sessionValidityEnsurer)
    this.tableName = tableNameResolver(MetadataHelper.get(this.modelClazz).modelOptions.tableName)
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

  makeRequest<Z>(operation: string, params?: { [key: string]: any }): Observable<Z> {
    return this.dynamoRx.makeRequest(operation, params)
  }

  /*
   * some methods which simplify calls which are usually often used
   * TODO review the methods
   */
  /**
   * executes a dynamoDB.batchGetItem for multiple keys or a operation
   *
   * @param {any[]} keys
   * @returns {Observable<T[]>}
   */
  byKeys(keys: any[]): Observable<T[]> {
    return this.findByMultipleKeys(keys)
  }

  findAll(): Observable<T[]> {
    return this.scan().exec()
  }

  // TODO how does this work when we work with composite primary key
  private findByMultipleKeys(keys: any[]): Observable<T[]> {
    const requestItems: { [nameDb: string]: { Keys: DynamoDB.AttributeMap[] } } = {}
    const attributeMaps: DynamoDB.AttributeMap[] = []
    keys.forEach(id => {
      // TODO add support for secondary index
      const idOb: DynamoDB.AttributeMap = {}
      idOb[MetadataHelper.get(this.modelClazz).getPartitionKey()] = Mapper.toDbOne(id)
      attributeMaps.push(idOb)
    })

    requestItems[this.tableName] = {
      Keys: attributeMaps,
    }

    const params: DynamoDB.BatchGetItemInput = {
      RequestItems: requestItems,
    }

    return this.dynamoRx.batchGetItems(params).map(response => {
      if (response.Responses && Object.keys(response.Responses).length) {
        return response.Responses[this.tableName].map(attributeMap => Mapper.fromDb(attributeMap, this.modelClazz))
      } else {
        return []
      }
    })
  }

  // private findBySingleKey(partitionKeyValue: any): Observable<T[]> {
  //   return this.query()
  //     .wherePartitionKey(partitionKeyValue)
  //     .exec()
  // }

  private createBaseParams(): { TableName: string } {
    const params: { TableName: string } = {
      TableName: this.tableName,
    }

    return params
  }
}
