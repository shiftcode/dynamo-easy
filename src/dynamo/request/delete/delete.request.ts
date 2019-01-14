import * as DynamoDB from 'aws-sdk/clients/dynamodb'
import { promiseTap } from '../../../helper'
import { createLogger, Logger } from '../../../logger/logger'
import { createKeyAttributes } from '../../../mapper'
import { ModelConstructor } from '../../../model'
import { DynamoRx } from '../../dynamo-rx'
import { WriteRequest } from '../write.request'

export class DeleteRequest<T> extends WriteRequest<T, DynamoDB.DeleteItemInput, DeleteRequest<T>> {
  private readonly logger: Logger

  constructor(dynamoRx: DynamoRx, modelClazz: ModelConstructor<T>, partitionKey: any, sortKey?: any) {
    super(dynamoRx, modelClazz)
    this.logger = createLogger('dynamo.request.DeleteRequest', modelClazz)
    this.params.Key = createKeyAttributes(this.metadata, partitionKey, sortKey)
  }

  execFullResponse(): Promise<DynamoDB.DeleteItemOutput> {
    this.logger.debug('request', this.params)
    return this.dynamoRx.deleteItem(this.params)
      .then(promiseTap(response => this.logger.debug('response', response)))
  }
}
