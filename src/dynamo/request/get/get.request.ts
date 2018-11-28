import { ReturnConsumedCapacity } from 'aws-sdk/clients/dynamodb'
import { values as objValues } from 'lodash'
import { Observable } from 'rxjs'
import { map, tap } from 'rxjs/operators'
import { hasSortKey } from '../../../decorator/metadata'
import { createLogger, Logger } from '../../../logger/logger'
import { Attributes, fromDb, toDbOne } from '../../../mapper'
import { ModelConstructor } from '../../../model'
import { DynamoRx } from '../../dynamo-rx'
import { resolveAttributeNames } from '../../expression/functions/attribute-names.function'
import { BaseRequest } from '../base.request'
import { GetResponse } from './get.response'

export class GetRequest<T> extends BaseRequest<T, any> {
  private readonly logger: Logger

  constructor(
    dynamoRx: DynamoRx,
    modelClazz: ModelConstructor<T>,
    tableName: string,
    partitionKey: any,
    sortKey?: any,
  ) {
    super(dynamoRx, modelClazz, tableName)
    this.logger = createLogger('dynamo.request.GetRequest', modelClazz)

    if (hasSortKey(this.metadata) && (sortKey === null || sortKey === undefined)) {
      throw new Error(`please provide the sort key for attribute ${this.metadata.getSortKey()}`)
    }

    const keyAttributeMap: Attributes<T> = <any>{}

    // partition key
    const partitionKeyValue = toDbOne(partitionKey, this.metadata.forProperty(this.metadata.getPartitionKey()))

    if (partitionKeyValue === null) {
      throw new Error('please provide an acutal value for partition key, got null')
    }

    keyAttributeMap[this.metadata.getPartitionKey()] = partitionKeyValue

    // sort key
    if (hasSortKey(this.metadata)) {
      const sortKeyValue = toDbOne(sortKey, this.metadata.forProperty(this.metadata.getSortKey()))

      if (sortKeyValue === null) {
        throw new Error('please provide an actual value for sort key, got null')
      }

      keyAttributeMap[this.metadata.getSortKey()] = sortKeyValue
    }

    this.params.Key = keyAttributeMap
  }

  consistentRead(consistendRead: boolean): GetRequest<T> {
    this.params.ConsistentRead = consistendRead
    return this
  }

  returnConsumedCapacity(level: ReturnConsumedCapacity): GetRequest<T> {
    this.params.ReturnConsumedCapacity = level
    return this
  }

  projectionExpression(...attributesToGet: string[]): GetRequest<T> {
    // tslint:disable-next-line:no-unnecessary-callback-wrapper
    const resolved = attributesToGet.map(a => resolveAttributeNames(a))
    this.params.ProjectionExpression = resolved.map(attr => attr.placeholder).join(', ')
    objValues(resolved).forEach(r => {
      this.params.ExpressionAttributeNames = { ...this.params.ExpressionAttributeNames, ...r.attributeNames }
    })
    return this
  }

  execFullResponse(): Observable<GetResponse<T>> {
    this.logger.debug('request', this.params)
    return this.dynamoRx.getItem(this.params).pipe(
      tap(response => this.logger.debug('response', response)),
      map(getItemResponse => {
        const response: GetResponse<T> = <any>{ ...getItemResponse }

        if (getItemResponse.Item) {
          response.Item = fromDb(<Attributes<T>>getItemResponse.Item, this.modelClazz)
        } else {
          response.Item = null
        }

        return response
      }),
      tap(response => this.logger.debug('mapped item', response.Item)),
    )
  }

  exec(): Observable<T | null> {
    this.logger.debug('request', this.params)
    return this.dynamoRx.getItem(this.params).pipe(
      tap(response => this.logger.debug('response', response)),
      map(response => {
        if (response.Item) {
          return fromDb(<Attributes<T>>response.Item, this.modelClazz)
        } else {
          return null
        }
      }),
      tap(item => this.logger.debug('mapped item', item)),
    )
  }
}
