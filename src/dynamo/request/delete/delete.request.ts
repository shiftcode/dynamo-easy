import * as DynamoDB from 'aws-sdk/clients/dynamodb'
import { Observable } from 'rxjs'
import { map, tap } from 'rxjs/operators'
import { createLogger, Logger } from '../../../logger/logger'
import { ModelConstructor } from '../../../model'
import { DynamoRx } from '../../dynamo-rx'
import { DeleteOperation } from '../../writeoperations/delete.operation'
import { WriteRequest } from '../write.request'

export class DeleteRequest<T> extends WriteRequest<DeleteRequest<T>, T, DynamoDB.DeleteItemInput> {
  private readonly logger: Logger
  readonly operation: DeleteOperation<T>

  get params(): DynamoDB.DeleteItemInput {
    return this.operation.params
  }

  constructor(dynamoRx: DynamoRx, modelClazz: ModelConstructor<T>, partitionKey: any, sortKey?: any) {
    super(dynamoRx, modelClazz)
    this.logger = createLogger('dynamo.request.DeleteRequest', modelClazz)
    this.operation = new DeleteOperation(modelClazz, partitionKey, sortKey)
  }

  execFullResponse(): Observable<DynamoDB.DeleteItemOutput> {
    this.logger.debug('request', this.params)
    return this.dynamoRx.deleteItem(this.params).pipe(tap(response => this.logger.debug('response', response)))
  }

  exec(): Observable<void> {
    return this.execFullResponse().pipe(
      map(response => {
        return
      }),
    )
  }
}
