import { DynamoDB } from 'aws-sdk'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { metadataForClass } from '../../decorator/metadata/metadata-helper'
import { randomExponentialBackoffTimer } from '../../helper'
import { createToKeyFn, fromDb } from '../../mapper'
import { Attributes } from '../../mapper/type/attribute.type'
import { ModelConstructor } from '../../model/model-constructor'
import { DEFAULT_SESSION_VALIDITY_ENSURER } from '../default-session-validity-ensurer.const'
import { DEFAULT_TABLE_NAME_RESOLVER } from '../default-table-name-resolver.const'
import { DynamoRx } from '../dynamo-rx'
import { REGEX_TABLE_NAME } from '../request/regex'
import { SessionValidityEnsurer } from '../session-validity-ensurer.type'
import { TableNameResolver } from '../table-name-resolver.type'
import { BatchGetFullResponse } from './batch-get-full.response'
import { batchGetItemsFetchAll } from './batch-get-utils'
import { BatchGetResponse } from './batch-get.response'

const MAX_REQUEST_ITEM_COUNT = 100
const DEFAULT_TIME_SLOT = 1000

export class BatchGetRequest {
  private readonly dynamoRx: DynamoRx
  private readonly tables: Map<string, ModelConstructor<any>> = new Map()
  readonly params: DynamoDB.BatchGetItemInput
  private itemCounter = 0

  constructor(
    private tableNameResolver: TableNameResolver = DEFAULT_TABLE_NAME_RESOLVER,
    sessionValidityEnsurer: SessionValidityEnsurer = DEFAULT_SESSION_VALIDITY_ENSURER,
  ) {
    this.dynamoRx = new DynamoRx(sessionValidityEnsurer)
    this.params = {
      RequestItems: {},
    }
  }

  private fetch(backoffTimer = randomExponentialBackoffTimer, throttleTimeSlot = DEFAULT_TIME_SLOT) {
    return batchGetItemsFetchAll(this.dynamoRx, { ...this.params }, backoffTimer(), throttleTimeSlot)
  }

  /**
   * @param {ModelConstructor<T>} modelClazz
   * @param {Partial<T>[]} keys a partial of T that contains Partition key and SortKey (if necessary). Throws if missing.
   * @param consistentRead
   * @returns {BatchGetSingleTableRequest}
   */
  forModel<T>(modelClazz: ModelConstructor<T>, keys: Array<Partial<T>>, consistentRead = false): BatchGetRequest {

    // check if table was already used in this request
    const tableName = this.getTableName(modelClazz, this.tableNameResolver)
    if (this.tables.has(tableName)) { throw new Error('table name already exists, please provide all the keys for the same table at once') }
    this.tables.set(tableName, modelClazz)

    // check if modelClazz is really an @Model() decorated class
    const metadata = metadataForClass(modelClazz)
    if (!metadata.modelOptions) { throw new Error('given ModelConstructor has no @Model decorator')}

    // check if keys to add do not exceed max count
    if (this.itemCounter + keys.length > MAX_REQUEST_ITEM_COUNT) { throw new Error(`you can request at max ${MAX_REQUEST_ITEM_COUNT} items per request`)}

    this.params.RequestItems[tableName] = {
      Keys: keys.map(createToKeyFn(modelClazz)),
      ConsistentRead: consistentRead,
    }

    this.itemCounter += keys.length

    return this
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

  private mapResponse = (response: DynamoDB.BatchGetItemOutput): BatchGetFullResponse => {
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
  }

  execNoMap(backoffTimer = randomExponentialBackoffTimer, throttleTimeSlot = DEFAULT_TIME_SLOT): Observable<DynamoDB.BatchGetItemOutput> {
    return this.fetch(backoffTimer, throttleTimeSlot)
  }

  execFullResponse(backoffTimer = randomExponentialBackoffTimer, throttleTimeSlot = DEFAULT_TIME_SLOT): Observable<BatchGetFullResponse> {
    return this.fetch(backoffTimer, throttleTimeSlot)
      .pipe(
        map(this.mapResponse),
      )
  }

  exec(backoffTimer = randomExponentialBackoffTimer, throttleTimeSlot = DEFAULT_TIME_SLOT): Observable<BatchGetResponse> {
    return this.fetch(backoffTimer, throttleTimeSlot)
      .pipe(
        map(this.mapResponse),
        map(r => r.Responses),
      )
  }

}
