import { DeleteItemInput, DeleteItemOutput } from 'aws-sdk/clients/dynamodb'
import { Observable } from 'rxjs'
import { map, tap } from 'rxjs/operators'
import { createLogger, Logger } from '../../../logger/logger'
import { Mapper } from '../../../mapper/mapper'
import { Attributes } from '../../../mapper/type/attribute.type'
import { ModelConstructor } from '../../../model/model-constructor'
import { DynamoRx } from '../../dynamo-rx'
import { WriteRequest } from '../write.request'

export class DeleteRequest<T> extends WriteRequest<DeleteRequest<T>, T, DeleteItemInput> {
  private readonly logger: Logger

  constructor(
    dynamoRx: DynamoRx,
    modelClazz: ModelConstructor<T>,
    tableName: string,
    partitionKey: any,
    sortKey?: any
  ) {
    super(dynamoRx, modelClazz, tableName)
    this.logger = createLogger('dynamo.request.DeleteRequest', modelClazz)

    const hasSortKey: boolean = this.metaData.getSortKey() !== null

    if (hasSortKey && (sortKey === null || sortKey === undefined)) {
      throw new Error(`please provide the sort key for attribute ${this.metaData.getSortKey()}`)
    }

    const keyAttributeMap: Attributes = {}

    // partition key
    const partitionKeyValue = Mapper.toDbOne(partitionKey, this.metaData.forProperty(this.metaData.getPartitionKey()))

    if (partitionKeyValue === null) {
      throw new Error('please provide an acutal value for partition key, got null')
    }

    keyAttributeMap[<string>this.metaData.getPartitionKey()] = partitionKeyValue

    // sort key
    if (hasSortKey) {
      const sortKeyValue = Mapper.toDbOne(sortKey!, this.metaData.forProperty(this.metaData.getSortKey()!))

      if (sortKeyValue === null) {
        throw new Error('please provide an actual value for sort key, got null')
      }

      keyAttributeMap[<string>this.metaData.getSortKey()!] = sortKeyValue
    }

    this.params.Key = keyAttributeMap
  }

  execFullResponse(): Observable<DeleteItemOutput> {
    this.logger.debug('request', this.params)
    return this.dynamoRx.deleteItem(this.params).pipe(tap(response => this.logger.debug('response', response)))
  }

  exec(): Observable<void> {
    return this.execFullResponse().pipe(
      map(response => {
        return
      })
    )
  }
}
