import { DeleteItemInput, DeleteItemOutput, Key } from 'aws-sdk/clients/dynamodb'
import { Observable } from 'rxjs'
import { map, tap } from 'rxjs/operators'
import { hasSortKey } from '../../../decorator/metadata/metadata'
import { createLogger, Logger } from '../../../logger/logger'
import { Attributes, toDbOne } from '../../../mapper'
import { ModelConstructor } from '../../../model'
import { DynamoRx } from '../../dynamo-rx'
import { WriteRequest } from '../write.request'

export class DeleteRequest<T> extends WriteRequest<DeleteRequest<T>, T, DeleteItemInput> {
  private readonly logger: Logger

  constructor(
    dynamoRx: DynamoRx,
    modelClazz: ModelConstructor<T>,
    tableName: string,
    partitionKey: any,
    sortKey?: any,
  ) {
    super(dynamoRx, modelClazz, tableName)
    this.logger = createLogger('dynamo.request.DeleteRequest', modelClazz)

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

    this.params.Key = <Key>keyAttributeMap
  }

  execFullResponse(): Observable<DeleteItemOutput> {
    this.logger.debug('request', this.params)
    return this.dynamoRx.deleteItem(this.params).pipe(tap(response => this.logger.debug('response', response)))
  }

  exec(): Observable<void> {
    return this.execFullResponse().pipe(
      map(response => {
        return
      }),
    )
  }
}
