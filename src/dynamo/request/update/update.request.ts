import * as DynamoDB from 'aws-sdk/clients/dynamodb'
import { promiseTap } from '../../../helper'
import { createLogger, Logger } from '../../../logger/logger'
import { createKeyAttributes } from '../../../mapper'
import { ModelConstructor } from '../../../model'
import { DynamoDbWrapper } from '../../dynamo-db-wrapper'
import { prepareAndAddUpdateExpressions } from '../../expression/prepare-and-add-update-expressions.function'
import { addUpdate } from '../../expression/request-expression-builder'
import { RequestUpdateFunction, UpdateExpressionDefinitionFunction } from '../../expression/type'
import { WriteRequest } from '../write.request'

export class UpdateRequest<T> extends WriteRequest<T, DynamoDB.UpdateItemInput, UpdateRequest<T>> {
  private readonly logger: Logger

  constructor(dynamoDBWrapper: DynamoDbWrapper, modelClazz: ModelConstructor<T>, partitionKey: any, sortKey?: any) {
    super(dynamoDBWrapper, modelClazz)
    this.logger = createLogger('dynamo.request.UpdateRequest', modelClazz)
    this.params.Key = createKeyAttributes(this.metadata, partitionKey, sortKey)
  }

  updateAttribute<K extends keyof T>(attributePath: K): RequestUpdateFunction<UpdateRequest<T>, T, K> {
    return addUpdate(attributePath, this, this.metadata)
  }

  operations(...updateDefFns: UpdateExpressionDefinitionFunction[]): UpdateRequest<T> {
    prepareAndAddUpdateExpressions(this.metadata, this.params, updateDefFns)
    return this
  }

  execFullResponse(): Promise<DynamoDB.UpdateItemOutput> {
    this.logger.debug('request', this.params)
    return this.dynamoDBWrapper.updateItem(this.params)
      .then(promiseTap(response => this.logger.debug('response', response)))
  }
}
