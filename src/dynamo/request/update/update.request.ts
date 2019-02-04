import * as DynamoDB from 'aws-sdk/clients/dynamodb'
import { promiseTap } from '../../../helper/promise-tap.function'
import { createLogger, Logger } from '../../../logger/logger'
import { createKeyAttributes } from '../../../mapper/mapper'
import { ModelConstructor } from '../../../model/model-constructor'
import { Omit } from '../../../model/omit.type'
import { DynamoDbWrapper } from '../../dynamo-db-wrapper'
import { prepareAndAddUpdateExpressions } from '../../expression/prepare-and-add-update-expressions.function'
import { addUpdate } from '../../expression/request-expression-builder'
import { RequestUpdateFunction } from '../../expression/type/update-expression-definition-chain'
import { UpdateExpressionDefinitionFunction } from '../../expression/type/update-expression-definition-function'
import { WriteRequest } from '../write.request'

type UpdateRequestReturnT<T> = Omit<UpdateRequest<T>, 'exec'> & { exec(): Promise<T> }
type UpdateRequestReturnPartialT<T> = Omit<UpdateRequest<T>, 'exec'> & { exec(): Promise<Partial<T>> }

export class UpdateRequest<T> extends WriteRequest<T, DynamoDB.UpdateItemInput, UpdateRequest<T>> {
  protected readonly logger: Logger

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

  returnValues(returnValues: 'ALL_OLD' | 'ALL_NEW'): UpdateRequestReturnT<T>
  returnValues(returnValues: 'UPDATED_OLD' | 'UPDATED_NEW'): UpdateRequestReturnPartialT<T>
  returnValues(returnValues: 'NONE'): UpdateRequest<T>
  returnValues(returnValues: 'ALL_OLD' | 'ALL_NEW' | 'UPDATED_OLD' | 'UPDATED_NEW' | 'NONE'): UpdateRequest<T> | UpdateRequestReturnT<T> | UpdateRequestReturnPartialT<T> {
    this.params.ReturnValues = returnValues
    return this
  }

  execFullResponse(): Promise<DynamoDB.UpdateItemOutput> {
    this.logger.debug('request', this.params)
    return this.dynamoDBWrapper.updateItem(this.params)
      .then(promiseTap(response => this.logger.debug('response', response)))
  }
}
