import { BatchGetItemInput } from 'aws-sdk/clients/dynamodb'
import { isObject, isString } from 'lodash'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { metadataForClass } from '../../decorator/metadata/metadata-helper'
import { fromDb, toDbOne } from '../../mapper'
import { Attributes } from '../../mapper/type/attribute.type'
import { ModelConstructor } from '../../model/model-constructor'
import { DEFAULT_SESSION_VALIDITY_ENSURER } from '../default-session-validity-ensurer.const'
import { DEFAULT_TABLE_NAME_RESOLVER } from '../default-table-name-resolver.const'
import { DynamoRx } from '../dynamo-rx'
import { PrimaryKey } from '../primary-key.type'
import { REGEX_TABLE_NAME } from '../request/regex'
import { SessionValidityEnsurer } from '../session-validity-ensurer.type'
import { TableNameResolver } from '../table-name-resolver.type'
import { BatchGetFullResponse } from './batch-get-full.response'
import { BatchGetResponse } from './batch-get.response'

export class BatchGetRequest {
  private readonly dynamoRx: DynamoRx

  private tables: Map<string, ModelConstructor<any>> = new Map()
  readonly params: BatchGetItemInput

  constructor(
    private tableNameResolver: TableNameResolver = DEFAULT_TABLE_NAME_RESOLVER,
    sessionValidityEnsurer: SessionValidityEnsurer = DEFAULT_SESSION_VALIDITY_ENSURER,
  ) {
    this.dynamoRx = new DynamoRx(sessionValidityEnsurer)
    this.params = <BatchGetItemInput>{
      RequestItems: {},
    }
  }

  /**
   * @param {ModelConstructor<T>} modelClazz
   * @param {any[]} keys either a simple string for partition key or an object with partitionKey and sortKey
   * @returns {BatchGetSingleTableRequest}
   */
  forModel<T>(modelClazz: ModelConstructor<T>, keys: Array<string | PrimaryKey>): BatchGetRequest {
    const tableName = this.getTableName(modelClazz, this.tableNameResolver)
    if (this.tables.has(tableName)) {
      throw new Error('table name already exists, please provide all the keys for the same table at once')
    }
    this.tables.set(tableName, modelClazz)

    const metadata = metadataForClass(modelClazz)
    const attributeMaps: Attributes[] = []

    // loop over all the keys
    keys.forEach(key => {
      const idOb: Attributes = {}

      if (isString(key)) {
        // got a simple primary key
        const value = toDbOne(key)
        if (value === null) {
          throw Error('please provide an actual value for partition key')
        }
        // FIXME: should work  without cast - because keyof T must be a string or symbol (error exists since update to  2.9.x -> check in a later version, there are some open issues)
        idOb[<string>metadata.getPartitionKey()] = value
      } else if (isObject(key) && key.partitionKey !== undefined && key.partitionKey !== null) {
        // got a composite primary key

        // partition key
        const mappedPartitionKey = toDbOne(key.partitionKey)
        if (mappedPartitionKey === null) {
          throw Error('please provide an actual value for partition key')
        }
        idOb[<string>metadata.getPartitionKey()] = mappedPartitionKey

        // sort key
        const mappedSortKey = toDbOne(key.sortKey)
        if (mappedSortKey === null) {
          throw Error('please provide an actual value for partition key')
        }

        idOb[<string>metadata.getSortKey()] = mappedSortKey
      } else {
        throw new Error('a key must either be a string or a PrimaryKey')
      }

      attributeMaps.push(idOb)
    })

    this.params.RequestItems[tableName] = {
      Keys: attributeMaps,
    }

    return this
  }

  execFullResponse(): Observable<BatchGetFullResponse> {
    return this.dynamoRx.batchGetItems(this.params).pipe(
      map(response => {
        let Responses: BatchGetResponse = {}
        if (response.Responses && Object.keys(response.Responses).length) {
          Responses = Object.entries(response.Responses).reduce((u: BatchGetResponse, [key, val]) => {
            u[key] = val.map(attributes => fromDb(<Attributes>attributes, this.tables.get(key)))
            return u
          }, {})
        }
        return {
          ConsumedCapacity: response.ConsumedCapacity,
          UnprocessedKeys: response.UnprocessedKeys,
          Responses,
        }
      }),
    )
  }

  exec(): Observable<BatchGetResponse> {
    return this.dynamoRx.batchGetItems(this.params).pipe(
      map(response => {
        if (response.Responses && Object.keys(response.Responses).length) {
          return Object.entries(response.Responses).reduce((u: BatchGetResponse, [key, val]) => {
            u[key] = val.map(attributeMap => fromDb(<Attributes>attributeMap, this.tables.get(key)))
            return u
          }, {})
        }
        return {}
      }),
    )
  }

  private getTableName(modelClazz: ModelConstructor<any>, tableNameResolver: TableNameResolver) {
    const tableName = tableNameResolver(metadataForClass(modelClazz).modelOptions.tableName)
    if (!REGEX_TABLE_NAME.test(tableName)) {
      throw new Error(
        'make sure the table name only contains these characters «a-z A-Z 0-9 - _ .» and is between 3 and 255 characters long',
      )
    }

    return tableName
  }
}
