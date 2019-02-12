/**
 * @module store-requests
 */
import * as DynamoDB from 'aws-sdk/clients/dynamodb'
import { createLogger, Logger } from '../../../logger/logger'
import { toDb } from '../../../mapper/mapper'
import { ModelConstructor } from '../../../model/model-constructor'
import { Omit } from '../../../model/omit.type'
import { DynamoDbWrapper } from '../../dynamo-db-wrapper'
import { createIfNotExistsCondition } from '../../expression/create-if-not-exists-condition.function'
import { WriteRequest } from '../write.request'
import { PutResponse } from './put.response'

type PutRequestReturnT<T> = Omit<Omit<PutRequest<T>, 'exec'>, 'execFullResponse'> & {
  exec(): Promise<T>
  execFullResponse(): Promise<PutResponse<T>>
}

/**
 * Request class for the PutItem operation.
 */
export class PutRequest<T> extends WriteRequest<T, DynamoDB.PutItemInput, DynamoDB.PutItemOutput, PutRequest<T>> {
  protected readonly logger: Logger

  constructor(dynamoDBWrapper: DynamoDbWrapper, modelClazz: ModelConstructor<T>, item: T) {
    super(dynamoDBWrapper, modelClazz)
    this.logger = createLogger('dynamo.request.PutRequest', modelClazz)
    this.params.Item = toDb(item, this.modelClazz)
  }

  /**
   * Adds a condition expression to the request, which makes sure the item will only be saved if the id does not exist
   */
  ifNotExists(predicate: boolean = true): PutRequest<T> {
    if (predicate) {
      this.onlyIf(...createIfNotExistsCondition(this.metadata))
    }
    return this
  }

  returnValues(returnValues: 'ALL_OLD'): PutRequestReturnT<T>
  returnValues(returnValues: 'NONE'): PutRequest<T>
  returnValues(returnValues: 'ALL_OLD' | 'NONE'): PutRequest<T> | PutRequestReturnT<T> {
    this.params.ReturnValues = returnValues
    return this
  }

  protected doRequest(params: DynamoDB.PutItemInput): Promise<DynamoDB.PutItemOutput> {
    return this.dynamoDBWrapper.putItem(params)
  }
}
