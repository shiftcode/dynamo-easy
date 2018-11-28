import { PutItemOutput } from 'aws-sdk/clients/dynamodb'
import { Observable } from 'rxjs'
import { map, tap } from 'rxjs/operators'
import { createLogger, Logger } from '../../../logger/logger'
import { Mapper } from '../../../mapper/mapper'
import { ModelConstructor } from '../../../model/model-constructor'
import { DynamoRx } from '../../dynamo-rx'
import { attribute } from '../../expression/logical-operator/attribute.function'
import { WriteRequest } from '../write.request'

export class PutRequest<T> extends WriteRequest<PutRequest<T>, T, any> {
  private readonly logger: Logger

  constructor(dynamoRx: DynamoRx, modelClazz: ModelConstructor<T>, tableName: string, item: T) {
    super(dynamoRx, modelClazz, tableName)
    this.logger = createLogger('dynamo.request.PutRequest', modelClazz)
    this.params.Item = Mapper.toDb(item, this.modelClazz)
  }

  /**
   * Adds a condition expression to the request, which makes sure the item will only be saved if the id does not exist
   * @returns {PutRequest<T>}
   */
  ifNotExists(predicate?: boolean): PutRequest<T> {
    // FIXME should we check for sort key too?
    const conditionDefFns = []
    if (predicate === undefined || (predicate !== undefined && predicate === true)) {
      conditionDefFns.push(attribute<T>(this.metaData.getPartitionKey()).attributeNotExists())

      const sortKey = this.metaData.getSortKey()
      if (sortKey !== null) {
        conditionDefFns.push(attribute<T>(sortKey).attributeNotExists())
      }

      this.onlyIf(...conditionDefFns)
    }

    return this
  }

  execFullResponse(): Observable<PutItemOutput> {
    this.logger.debug('request', this.params)
    return this.dynamoRx.putItem(this.params).pipe(tap(response => this.logger.debug('response', response)))
  }

  exec(): Observable<void> {
    return this.execFullResponse().pipe(
      map(response => {
        return
      }),
    )
  }
}
