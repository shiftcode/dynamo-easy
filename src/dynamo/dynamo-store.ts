import * as DynamoDB from 'aws-sdk/clients/dynamodb'
import { Observable } from 'rxjs/Observable'
import { MetadataHelper } from '../decorator/metadata/metadata-helper'
import { Mapper } from '../mapper/mapper'
import { ModelConstructor } from '../model/model-constructor'
import { DynamoRx } from './dynamo-rx'
import { DeleteRequest } from './request/delete/delete.request'
import { GetRequest } from './request/get/get.request'
import { PutRequest } from './request/put/put.request'
import { QueryRequest } from './request/query/query.request'
import { ScanRequest } from './request/scan/scan.request'
import { UpdateRequest } from './request/update/update.request'

export class DynamoStore<T> {
  private readonly dynamoRx: DynamoRx
  private readonly tableName: string
  private readonly mapper: Mapper

  constructor(private modelClazz: ModelConstructor<T>) {
    this.dynamoRx = new DynamoRx()
    this.tableName = MetadataHelper.get(this.modelClazz).modelOptions.tableName
  }

  get dynamoDb(): DynamoDB {
    return this.dynamoRx.dynamoDb
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

  makeRequest<Z>(operation: string, params?: { [key: string]: any }): Observable<Z> {
    return this.dynamoRx.makeRequest(operation, params)
  }

  /*
   * some methods which simplify calls which are usually often used
   * TODO review the methods
   */
  /**
   * will execute a dynamoDB.getItem operation
   *
   * @param keyValue
   * @returns {Observable<T>}
   */
  findBy(keyValue: any): Observable<T | null>

  /**
   * executes a dynamoDB.batchGetItem operation
   *
   * @param {any[]} keys
   * @returns {Observable<T[]>}
   */
  findBy(keys: any[]): Observable<T[]>

  findBy(by: any | any[]): Observable<T[] | T | null> {
    if (Array.isArray(by)) {
      return this.findByMultipleKeys(by)
    } else {
      return this.findBySingleKey(by)
    }
  }

  findAll(): Observable<T[]> {
    return this.scan().exec()
  }

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

  private findBySingleKey(key: any): Observable<T | null> {
    return this.query()
      .wherePartitionKey(key)
      .execSingle()
  }

  private createBaseParams(): { TableName: string } {
    const params: { TableName: string } = {
      TableName: this.tableName,
    }

    return params
  }
}
