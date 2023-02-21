/**
 * @module store-requests
 */
import * as DynamoDB from '@aws-sdk/client-dynamodb'
import { createLogger, Logger } from '../../../logger/logger'
import { toDb } from '../../../mapper/mapper'
import { ModelConstructor } from '../../../model/model-constructor'
import { DynamoDbWrapper } from '../../dynamo-db-wrapper'
import { createIfNotExistsCondition } from '../../expression/create-if-not-exists-condition.function'
import { WriteRequest } from '../write.request'

/**
 * Request class for the PutItem operation.
 */
export class PutRequest<T, T2 = void> extends WriteRequest<
  T,
  T2,
  DynamoDB.PutItemInput,
  DynamoDB.PutItemOutput,
  PutRequest<T, T2>
> {
  protected readonly logger: Logger

  constructor(dynamoDBWrapper: DynamoDbWrapper, modelClazz: ModelConstructor<T>, item: T) {
    super(dynamoDBWrapper, modelClazz)
    this.logger = createLogger('dynamo.request.PutRequest', modelClazz)
    this.params.Item = toDb(item, this.modelClazz)
  }

  /**
   * Adds a condition expression to the request, which makes sure the item will only be saved if the id does not exist
   * @param predicate if false is provided nothing happens (it does NOT remove the condition)
   */
  ifNotExists(predicate: boolean = true): this {
    if (predicate) {
      this.onlyIf(...createIfNotExistsCondition(this.metadata))
    }

    return this
  }

  returnValues(returnValues: 'ALL_OLD'): PutRequest<T, T>
  returnValues(returnValues: 'NONE'): PutRequest<T, void>
  returnValues(returnValues: 'ALL_OLD' | 'NONE'): PutRequest<T, T | void> {
    this.params.ReturnValues = returnValues
    return <any>this
  }

  protected doRequest(params: DynamoDB.PutItemInput): Promise<DynamoDB.PutItemOutput> {
    return this.dynamoDBWrapper.putItem(params)
  }
}
