/**
 * @module store-requests
 */
import * as DynamoDB from '@aws-sdk/client-dynamodb'
import { createLogger, Logger } from '../../../logger/logger'
import { createKeyAttributes } from '../../../mapper/mapper'
import { ModelConstructor } from '../../../model/model-constructor'
import { DynamoDbWrapper } from '../../dynamo-db-wrapper'
import { prepareAndAddUpdateExpressions } from '../../expression/prepare-and-add-update-expressions.function'
import { addUpdate } from '../../expression/request-expression-builder'
import { RequestUpdateFunction } from '../../expression/type/update-expression-definition-chain'
import { UpdateExpressionDefinitionFunction } from '../../expression/type/update-expression-definition-function'
import { WriteRequest } from '../write.request'

/**
 * Request class for the UpdateItem operation.
 */
export class UpdateRequest<T, T2 extends T | Partial<T> | void = void> extends WriteRequest<
  T,
  T2,
  DynamoDB.UpdateItemInput,
  DynamoDB.UpdateItemOutput,
  UpdateRequest<T, T2>
> {
  protected readonly logger: Logger

  constructor(dynamoDBWrapper: DynamoDbWrapper, modelClazz: ModelConstructor<T>, partitionKey: any, sortKey?: any) {
    super(dynamoDBWrapper, modelClazz)
    this.logger = createLogger('dynamo.request.UpdateRequest', modelClazz)
    this.params.Key = createKeyAttributes(this.metadata, partitionKey, sortKey)
  }

  /**
   * create and add a single update operation
   * @example req.updateAttribute('path.to.attr').set('newVal')
   */
  updateAttribute<K extends keyof T>(attributePath: K): RequestUpdateFunction<this, T, K> {
    return addUpdate(attributePath, this, this.metadata)
  }

  /**
   * add multiple update operations comma separated
   * @example req.operations(update('path.to.attr).set('newVal'), ... )
   */
  operations(...updateDefFns: UpdateExpressionDefinitionFunction[]): this {
    prepareAndAddUpdateExpressions(this.metadata, this.params, updateDefFns)
    return this
  }

  returnValues(returnValues: 'ALL_OLD' | 'ALL_NEW'): UpdateRequest<T, T>
  returnValues(returnValues: 'UPDATED_OLD' | 'UPDATED_NEW'): UpdateRequest<T, Partial<T>>
  returnValues(returnValues: 'NONE'): UpdateRequest<T, void>
  returnValues(
    returnValues: 'ALL_OLD' | 'ALL_NEW' | 'UPDATED_OLD' | 'UPDATED_NEW' | 'NONE',
  ): UpdateRequest<T, T | Partial<T> | void> {
    this.params.ReturnValues = returnValues
    return this
  }

  protected doRequest(params: DynamoDB.UpdateItemInput): Promise<DynamoDB.UpdateItemOutput> {
    return this.dynamoDBWrapper.updateItem(params)
  }
}
