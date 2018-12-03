import * as DynamoDB from 'aws-sdk/clients/dynamodb'
import { Observable } from 'rxjs'
import { map, tap } from 'rxjs/operators'
import { createLogger, Logger } from '../../../logger/logger'
import { ModelConstructor } from '../../../model'
import { DynamoRx } from '../../dynamo-rx'
import { PutOperation } from '../../writeoperations/put.operation'
import { WriteRequest } from '../write.request'

export class PutRequest<T> extends WriteRequest<PutRequest<T>, T, DynamoDB.PutItemInput> {
  private readonly logger: Logger
  readonly operation: PutOperation<T>

  get params(): DynamoDB.PutItemInput {
    return this.operation.params
  }

  constructor(dynamoRx: DynamoRx, modelClazz: ModelConstructor<T>, item: T) {
    super(dynamoRx, modelClazz)
    this.logger = createLogger('dynamo.request.PutRequest', modelClazz)
    this.operation = new PutOperation(modelClazz, item)
  }

  /**
   * Adds a condition expression to the request, which makes sure the item will only be saved if the id does not exist
   * @returns {PutRequest<T>}
   */
  ifNotExists(predicate: boolean = true): PutRequest<T> {
    this.operation.ifNotExists(predicate)
    return this
  }

  execFullResponse(): Observable<DynamoDB.PutItemOutput> {
    this.logger.debug('request', this.params)
    return this.dynamoRx.putItem(this.params).pipe(tap(response => this.logger.debug('response', response)))
  }

  exec(): Observable<void> {
    return this.execFullResponse().pipe(
      map(response => {
        return
      }),
    )
  }
}
