import * as DynamoDB from 'aws-sdk/clients/dynamodb'
import { promiseTap } from '../../../helper/promise-tap.function'
import { createLogger, Logger } from '../../../logger/logger'
import { createKeyAttributes } from '../../../mapper/mapper'
import { ModelConstructor } from '../../../model/model-constructor'
import { DynamoDbWrapper } from '../../dynamo-db-wrapper'
import { WriteRequest } from '../write.request'

export class DeleteRequest<T> extends WriteRequest<T, DynamoDB.DeleteItemInput, DeleteRequest<T>> {
  private readonly logger: Logger

  constructor(dynamoDBWrapper: DynamoDbWrapper, modelClazz: ModelConstructor<T>, partitionKey: any, sortKey?: any) {
    super(dynamoDBWrapper, modelClazz)
    this.logger = createLogger('dynamo.request.DeleteRequest', modelClazz)
    this.params.Key = createKeyAttributes(this.metadata, partitionKey, sortKey)
  }

  execFullResponse(): Promise<DynamoDB.DeleteItemOutput> {
    this.logger.debug('request', this.params)
    return this.dynamoDBWrapper.deleteItem(this.params)
      .then(promiseTap(response => this.logger.debug('response', response)))
  }
}
