import { AttributeMap, BatchGetItemInput } from 'aws-sdk/clients/dynamodb'
import { isObject, isString } from 'lodash'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { MetadataHelper } from '../../decorator/metadata/metadata-helper'
import { Mapper } from '../../mapper/mapper'
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
    sessionValidityEnsurer: SessionValidityEnsurer = DEFAULT_SESSION_VALIDITY_ENSURER
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

    const metadata = MetadataHelper.get(modelClazz)
    const attributeMaps: AttributeMap[] = []

    // loop over all the keys
    keys.forEach(key => {
      const idOb: AttributeMap = {}

      if (isString(key)) {
        // got a simple primary key
        const value = Mapper.toDbOne(key)
        if (value === null) {
          throw Error('please provide an actual value for partition key')
        }
        // FIXME: should work  without cast - because keyof T must be a string or symbol (error exists since update to  2.9.x -> check in a later version, there are some open issues)
        idOb[<string>metadata.getPartitionKey()] = value
      } else if (isObject(key) && key.partitionKey !== undefined && key.partitionKey !== null) {
        // got a composite primary key

        // partition key
        const mappedPartitionKey = Mapper.toDbOne(key.partitionKey)
        if (mappedPartitionKey === null) {
          throw Error('please provide an actual value for partition key')
        }
        idOb[<string>metadata.getPartitionKey()] = mappedPartitionKey

        // sort key
        const mappedSortKey = Mapper.toDbOne(key.sortKey)
        if (mappedSortKey === null) {
          throw Error('please provide an actual value for partition key')
        }

        idOb[<string>metadata.getSortKey()!] = mappedSortKey
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
        const r = <BatchGetFullResponse>{
          ConsumedCapacity: response.ConsumedCapacity,
          UnprocessedKeys: response.UnprocessedKeys,
          Responses: {},
        }

        if (response.Responses && Object.keys(response.Responses).length) {
          Object.keys(response.Responses).forEach(tableName => {
            const mapped = response.Responses![tableName].map(attributeMap =>
              Mapper.fromDb(<Attributes>attributeMap, this.tables.get(tableName))
            )
            r.Responses![tableName] = mapped
          })
        }

        return r
      })
    )
  }

  exec(): Observable<BatchGetResponse> {
    return this.dynamoRx.batchGetItems(this.params).pipe(
      map(response => {
        const r = <BatchGetResponse>{}
        if (response.Responses && Object.keys(response.Responses).length) {
          Object.keys(response.Responses).forEach(tableName => {
            const mapped = response.Responses![tableName].map(attributeMap =>
              Mapper.fromDb(<Attributes>attributeMap, this.tables.get(tableName))
            )
            r[tableName] = mapped
          })

          return r
        } else {
          return {}
        }
      })
    )
  }

  private getTableName(modelClazz: ModelConstructor<any>, tableNameResolver: TableNameResolver) {
    const tableName = tableNameResolver(MetadataHelper.get(modelClazz).modelOptions.tableName)
    if (!REGEX_TABLE_NAME.test(tableName)) {
      throw new Error(
        'make sure the table name only contains these characters «a-z A-Z 0-9 - _ .» and is between 3 and 255 characters long'
      )
    }

    return tableName
  }
}
