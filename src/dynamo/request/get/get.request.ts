/**
 * @module store-requests
 */
import * as DynamoDB from '@aws-sdk/client-dynamodb'
import { promiseTap } from '../../../helper/promise-tap.function'
import { createLogger, Logger } from '../../../logger/logger'
import { createKeyAttributes, fromDb } from '../../../mapper/mapper'
import { Attributes } from '../../../mapper/type/attribute.type'
import { ModelConstructor } from '../../../model/model-constructor'
import { DynamoDbWrapper } from '../../dynamo-db-wrapper'
import { addProjectionExpressionParam } from '../helper/add-projection-expression-param.function'
import { StandardRequest } from '../standard.request'
import { GetResponse } from './get.response'

/**
 * Request class for the GetItem operation.
 */
export class GetRequest<T, T2 extends Partial<T> = T> extends StandardRequest<
  T,
  T2,
  DynamoDB.GetItemInput,
  GetRequest<T, T2>
> {
  private readonly logger: Logger

  constructor(dynamoDBWrapper: DynamoDbWrapper, modelClazz: ModelConstructor<T>, partitionKey: any, sortKey?: any) {
    super(dynamoDBWrapper, modelClazz)
    this.logger = createLogger('dynamo.request.GetRequest', modelClazz)
    this.params.Key = createKeyAttributes(this.metadata, partitionKey, sortKey)
  }

  /**
   * Determines the read consistency model: If set to true, then the operation uses strongly consistent reads; otherwise, the operation uses eventually consistent reads.
   */
  consistentRead(consistentRead: boolean = true): this {
    this.params.ConsistentRead = consistentRead
    return this
  }

  /**
   * Specifies the list of model attributes to be returned from the table instead of returning the entire document
   * @param attributesToGet List of model attributes to be returned
   */
  projectionExpression(...attributesToGet: Array<keyof T | string>): GetRequest<T, Partial<T>> {
    addProjectionExpressionParam(attributesToGet, this.params, this.metadata)
    return this
  }

  execFullResponse(): Promise<GetResponse<T2>> {
    this.logger.debug('request', this.params)
    return this.dynamoDBWrapper
      .getItem(this.params)
      .then(promiseTap((response) => this.logger.debug('response', response)))
      .then((getItemResponse) => {
        // TODO v3: investigate on how to remove any
        // tslint:disable-next-line:no-unnecessary-type-assertion
        const response: GetResponse<T2> = { ...(getItemResponse as any) }

        if (getItemResponse.Item) {
          response.Item = fromDb(<Attributes<T2>>getItemResponse.Item, <any>this.modelClazz)
        } else {
          response.Item = null
        }

        return response
      })
      .then(promiseTap((response) => this.logger.debug('mapped item', response.Item)))
  }

  /**
   * execute request and return the parsed item
   */
  exec(): Promise<T2 | null> {
    this.logger.debug('request', this.params)
    return this.dynamoDBWrapper
      .getItem(this.params)
      .then(promiseTap((response) => this.logger.debug('response', response)))
      .then((response) => {
        if (response.Item) {
          return fromDb(<Attributes<T2>>response.Item, <any>this.modelClazz)
        } else {
          return null
        }
      })
      .then(promiseTap((item) => this.logger.debug('mapped item', item)))
  }
}
