import { BatchGetItemInput } from 'aws-sdk/clients/dynamodb'
import { isObject } from 'lodash'
import { Observable } from 'rxjs'
import { map, tap } from 'rxjs/operators'
import { Metadata, metadataForClass } from '../../../decorator/metadata'
import { createLogger, Logger } from '../../../logger/logger'
import { Attributes, fromDb, toDbOne } from '../../../mapper'
import { ModelConstructor } from '../../../model'
import { DynamoRx } from '../../dynamo-rx'
import { BatchGetSingleTableResponse } from './batch-get-single-table.response'

// TODO add support for indexes
export class BatchGetSingleTableRequest<T> {
  private readonly logger: Logger
  readonly dynamoRx: DynamoRx
  readonly params: BatchGetItemInput
  readonly modelClazz: ModelConstructor<T>
  readonly tableName: string

  private metadata: Metadata<T>

  // todo: make use of toKey<T>(item: T, modelConstructor: ModelConstructor<T>)
  constructor(dynamoRx: DynamoRx, modelClazz: ModelConstructor<T>, tableName: string, keys: any[]) {
    this.logger = createLogger('dynamo.request.BatchGetSingleTableRequest', modelClazz)
    this.dynamoRx = dynamoRx

    if (modelClazz === null || modelClazz === undefined) {
      throw new Error("please provide the model clazz for the request, won't work otherwise")
    }

    this.modelClazz = modelClazz
    this.params = <BatchGetItemInput>{
      RequestItems: {},
    }

    this.tableName = tableName

    this.addKeyParams(keys)
  }

  get metaData(): Metadata<T> {
    if (!this.metadata) {
      this.metadata = metadataForClass(this.modelClazz)
    }

    return this.metadata
  }

  execFullResponse(): Observable<BatchGetSingleTableResponse<T>> {
    this.logger.debug('request', this.params)
    return this.dynamoRx.batchGetItems(this.params).pipe(
      tap(response => this.logger.debug('response', response)),
      map(response => {
        let items: T[]
        if (response.Responses && Object.keys(response.Responses).length && response.Responses[this.tableName]) {
          const mapped: T[] = response.Responses[this.tableName].map(attributeMap =>
            fromDb(<Attributes>attributeMap, this.modelClazz),
          )
          items = mapped
        } else {
          items = []
        }

        return {
          Items: items,
          UnprocessedKeys: response.UnprocessedKeys,
          ConsumedCapacity: response.ConsumedCapacity,
        }
      }),
      tap(response => this.logger.debug('mapped items', response.Items)),
    )
  }

  exec(): Observable<T[]> {
    this.logger.debug('request', this.params)
    return this.dynamoRx.batchGetItems(this.params).pipe(
      tap(response => this.logger.debug('response', response)),
      map(response => {
        if (response.Responses && Object.keys(response.Responses).length && response.Responses[this.tableName]) {
          return response.Responses[this.tableName].map(attributeMap =>
            fromDb(<Attributes>attributeMap, this.modelClazz),
          )
        } else {
          return []
        }
      }),
      tap(items => this.logger.debug('mapped items', items)),
    )
  }

  private addKeyParams(keys: any[]) {
    const attributeMaps: Attributes[] = []

    keys.forEach(key => {
      const idOb: Attributes = {}
      if (isObject(key)) {
        // TODO add some more checks
        // got a composite primary key

        // partition key
        const mappedPartitionKey = toDbOne(key.partitionKey)
        if (mappedPartitionKey === null) {
          throw Error('please provide an actual value for partition key')
        }
        idOb[<string>this.metaData.getPartitionKey()] = mappedPartitionKey

        // sort key
        const mappedSortKey = toDbOne(key.sortKey)
        if (mappedSortKey === null) {
          throw Error('please provide an actual value for partition key')
        }

        idOb[<string>this.metaData.getSortKey()] = mappedSortKey
      } else {
        // got a simple primary key
        const value = toDbOne(key)
        if (value === null) {
          throw Error('please provide an actual value for partition key')
        }

        idOb[<string>this.metaData.getPartitionKey()] = value
      }

      attributeMaps.push(idOb)
    })

    this.params.RequestItems[this.tableName] = {
      Keys: attributeMaps,
    }
  }
}
