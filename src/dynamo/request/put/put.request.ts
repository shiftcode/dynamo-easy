import * as DynamoDB from 'aws-sdk/clients/dynamodb'
import { promiseTap } from '../../../helper'
import { createLogger, Logger } from '../../../logger/logger'
import { toDb } from '../../../mapper'
import { ModelConstructor } from '../../../model'
import { DynamoPromisified } from '../../dynamo-promisified'
import { createIfNotExistsCondition } from '../../expression/create-if-not-exists-condition.function'
import { WriteRequest } from '../write.request'

export class PutRequest<T> extends WriteRequest<T, DynamoDB.PutItemInput, PutRequest<T>> {
  private readonly logger: Logger

  constructor(dynamoRx: DynamoPromisified, modelClazz: ModelConstructor<T>, item: T) {
    super(dynamoRx, modelClazz)
    this.logger = createLogger('dynamo.request.PutRequest', modelClazz)
    this.params.Item = toDb(item, this.modelClazz)
  }

  /**
   * Adds a condition expression to the request, which makes sure the item will only be saved if the id does not exist
   * @returns {PutRequest<T>}
   */
  ifNotExists(predicate: boolean = true): PutRequest<T> {
    if (predicate) {
      this.onlyIf(...createIfNotExistsCondition(this.metadata))
    }
    return this
  }

  execFullResponse(): Promise<DynamoDB.PutItemOutput> {
    this.logger.debug('request', this.params)
    return this.dynamoRx.putItem(this.params)
      .then(promiseTap(response => this.logger.debug('response', response)))
  }
}
