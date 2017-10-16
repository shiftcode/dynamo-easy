import { AttributeMap, BatchGetItemInput } from 'aws-sdk/clients/dynamodb'
import { isObject } from 'lodash'
import { Observable } from 'rxjs/Observable'
import { MetadataHelper } from '../../decorator/metadata/metadata-helper'
import { Mapper } from '../../mapper/mapper'
import { ModelConstructor } from '../../model/model-constructor'
import { DEFAULT_SESSION_VALIDITY_ENSURER } from '../default-session-validity-ensurer.const'
import { DEFAULT_TABLE_NAME_RESOLVER } from '../default-table-name-resolver.const'
import { DynamoRx } from '../dynamo-rx'
import { REGEX_TABLE_NAME } from '../request/regex'
import { SessionValidityEnsurer } from '../session-validity-ensurer.type'
import { TableNameResolver } from '../table-name-resolver.type'

interface TableConfig<T> {
  tableName: string
  modelClazz: ModelConstructor<T>
  keys: any[]
}

// tslint:disable-next-line:interface-over-type-literal
export type BatchGetItemResponse = { [tableName: string]: any[] }

export class BatchGetRequest {
  private readonly dynamoRx: DynamoRx

  private tables: Map<string, TableConfig<any>> = new Map()
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
  forModel<T>(modelClazz: ModelConstructor<T>, keys: any[]): BatchGetRequest {
    const tableName = this.getTableName(modelClazz, this.tableNameResolver)
    if (this.tables.has(tableName)) {
      throw new Error('table name already exists, please provide all the keys for the same table at once')
    }

    const metadata = MetadataHelper.get(modelClazz)
    const attributeMaps: AttributeMap[] = []

    // loop over all the keys
    keys.forEach(key => {
      const idOb: AttributeMap = {}

      if (isObject(key)) {
        // TODO add some more checks
        // got a composite primary key

        // partition key
        const mappedPartitionKey = Mapper.toDbOne(key.partitionKey)
        if (mappedPartitionKey === null) {
          throw Error('please provide an actual value for partition key')
        }
        idOb[metadata.getPartitionKey()] = mappedPartitionKey

        // sort key
        const mappedSortKey = Mapper.toDbOne(key.sortKey)
        if (mappedSortKey === null) {
          throw Error('please provide an actual value for partition key')
        }

        idOb[metadata.getSortKey()!] = mappedSortKey
      } else {
        // got a simple primary key
        const value = Mapper.toDbOne(key)
        if (value === null) {
          throw Error('please provide an actual value for partition key')
        }

        idOb[metadata.getPartitionKey()] = value
      }

      attributeMaps.push(idOb)
    })

    this.params.RequestItems[tableName] = {
      Keys: attributeMaps,
    }
    return this
  }

  execFullResponse() {}

  // TODO fix any
  // TODO add support for indexes
  exec(): Observable<BatchGetItemResponse> {
    return this.dynamoRx.batchGetItems(this.params).map(response => {
      const r = <BatchGetItemResponse>{}
      if (response.Responses && Object.keys(response.Responses).length) {
        const responses: { [key: string]: AttributeMap } = {}
        Object.keys(response.Responses).forEach(tableName => {
          const mapped = response.Responses![tableName].map(attributeMap =>
            Mapper.fromDb(attributeMap, this.tables.get(tableName)!.modelClazz)
          )
          r[tableName] = mapped
        })

        return r
      } else {
        return {}
      }
    })
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
