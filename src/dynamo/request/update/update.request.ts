import * as DynamoDB from 'aws-sdk/clients/dynamodb'
import { Observable } from 'rxjs'
import { tap } from 'rxjs/operators'
import { createLogger, Logger } from '../../../logger/logger'
import { createKeyAttributes } from '../../../mapper'
import { ModelConstructor } from '../../../model'
import { DynamoRx } from '../../dynamo-rx'
import { prepareAndAddUpdateExpressions } from '../../expression/prepare-and-add-update-expressions.function'
import { addUpdate } from '../../expression/request-expression-builder'
import { RequestUpdateFunction, UpdateExpressionDefinitionFunction } from '../../expression/type'
import { WriteRequest } from '../write.request'

export class UpdateRequest<T> extends WriteRequest<T, DynamoDB.UpdateItemInput, UpdateRequest<T>> {
  private readonly logger: Logger

  constructor(dynamoRx: DynamoRx, modelClazz: ModelConstructor<T>, partitionKey: any, sortKey?: any) {
    super(dynamoRx, modelClazz)
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

  execFullResponse(): Observable<DynamoDB.UpdateItemOutput> {
    this.logger.debug('request', this.params)
    return this.dynamoRx.updateItem(this.params).pipe(tap(response => this.logger.debug('response', response)))
  }
}
