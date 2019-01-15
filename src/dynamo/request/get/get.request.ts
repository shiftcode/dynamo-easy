import * as DynamoDB from 'aws-sdk/clients/dynamodb'
import { promiseTap } from '../../../helper'
import { createLogger, Logger } from '../../../logger/logger'
import { Attributes, createKeyAttributes, fromDb } from '../../../mapper'
import { ModelConstructor } from '../../../model'
import { DynamoDbWrapper } from '../../dynamo-db-wrapper'
import { resolveAttributeNames } from '../../expression/functions/attribute-names.function'
import { StandardRequest } from '../standard.request'
import { GetResponse } from './get.response'

export class GetRequest<T> extends StandardRequest<T, DynamoDB.GetItemInput, GetRequest<T>> {
  private readonly logger: Logger

  constructor(dynamoDBWrapper: DynamoDbWrapper, modelClazz: ModelConstructor<T>, partitionKey: any, sortKey?: any) {
    super(dynamoDBWrapper, modelClazz)
    this.logger = createLogger('dynamo.request.GetRequest', modelClazz)
    this.params.Key = createKeyAttributes(this.metadata, partitionKey, sortKey)
  }

  consistentRead(consistentRead: boolean): GetRequest<T> {
    this.params.ConsistentRead = consistentRead
    return this
  }

  projectionExpression(...attributesToGet: string[]): GetRequest<T> {
    // tslint:disable-next-line:no-unnecessary-callback-wrapper
    const resolved = attributesToGet.map(a => resolveAttributeNames(a))
    this.params.ProjectionExpression = resolved.map(attr => attr.placeholder).join(', ')
    Object.values(resolved).forEach(r => {
      this.params.ExpressionAttributeNames = { ...this.params.ExpressionAttributeNames, ...r.attributeNames }
    })
    return this
  }

  execFullResponse(): Promise<GetResponse<T>> {
    this.logger.debug('request', this.params)
    return this.dynamoDBWrapper.getItem(this.params)
      .then(promiseTap(response => this.logger.debug('response', response)))
      .then(getItemResponse => {
        const response: GetResponse<T> = <any>{ ...getItemResponse }

        if (getItemResponse.Item) {
          response.Item = fromDb(<Attributes<T>>getItemResponse.Item, this.modelClazz)
        } else {
          response.Item = null
        }

        return response
      })
      .then(promiseTap(response => this.logger.debug('mapped item', response.Item)))

  }

  exec(): Promise<T | null> {
    this.logger.debug('request', this.params)
    return this.dynamoDBWrapper.getItem(this.params)
      .then(promiseTap(response => this.logger.debug('response', response)))
      .then(response => {
        if (response.Item) {
          return fromDb(<Attributes<T>>response.Item, this.modelClazz)
        } else {
          return null
        }
      })
      .then(promiseTap(item => this.logger.debug('mapped item', item)))
  }
}
