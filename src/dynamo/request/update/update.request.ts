import * as DynamoDB from 'aws-sdk/clients/dynamodb'
import { Observable } from 'rxjs'
import { map, tap } from 'rxjs/operators'
import { createLogger, Logger } from '../../../logger/logger'
import { ModelConstructor } from '../../../model'
import { createKeyAttributes } from '../../create-ket-attributes.function'
import { DynamoRx } from '../../dynamo-rx'
import { UpdateExpression, UpdateExpressionDefinitionFunction } from '../../expression/type'
import { UpdateActionKeyword } from '../../expression/type/update-action-keyword.type'
import { prepareAndAddUpdateExpressions } from '../../prepare-and-add-update-expressions.function'
import { WriteRequest } from '../write.request'

export type SortedUpdateExpressions = { [key in UpdateActionKeyword]: UpdateExpression[] }

export class UpdateRequest<T> extends WriteRequest<UpdateRequest<T>, T, DynamoDB.UpdateItemInput> {
  private readonly logger: Logger

  constructor(dynamoRx: DynamoRx, modelClazz: ModelConstructor<T>, partitionKey: any, sortKey?: any) {
    super(dynamoRx, modelClazz)
    this.logger = createLogger('dynamo.request.UpdateRequest', modelClazz)
    this.params.Key = createKeyAttributes(this.metadata, partitionKey, sortKey)
  }

  operations(...updateDefFns: UpdateExpressionDefinitionFunction[]): UpdateRequest<T> {
    prepareAndAddUpdateExpressions(this.metadata, this.params, updateDefFns)
    return this
  }

  execFullResponse(): Observable<DynamoDB.UpdateItemOutput> {
    this.logger.debug('request', this.params)
    return this.dynamoRx.updateItem(this.params).pipe(tap(response => this.logger.debug('response', response)))
  }

  exec(): Observable<void> {
    return this.execFullResponse().pipe(
      map(response => {
        return
      }),
    )
  }
}
