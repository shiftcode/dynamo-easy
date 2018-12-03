import * as DynamoDB from 'aws-sdk/clients/dynamodb'
import { values as objValues } from 'lodash'
import { Observable } from 'rxjs'
import { map, tap } from 'rxjs/operators'
import { createLogger, Logger } from '../../../logger/logger'
import { Attributes, fromDb } from '../../../mapper'
import { ModelConstructor } from '../../../model'
import { createKeyAttributes } from '../../create-ket-attributes.function'
import { DynamoRx } from '../../dynamo-rx'
import { resolveAttributeNames } from '../../expression/functions/attribute-names.function'
import { getTableName } from '../../get-table-name.function'
import { BaseRequest } from '../base.request'
import { GetResponse } from './get.response'

export class GetRequest<T> extends BaseRequest<T, any> {
  private readonly logger: Logger
  readonly params: DynamoDB.GetItemInput

  constructor(dynamoRx: DynamoRx, modelClazz: ModelConstructor<T>, partitionKey: any, sortKey?: any) {
    super(dynamoRx, modelClazz)
    this.logger = createLogger('dynamo.request.GetRequest', modelClazz)
    this.params = {
      TableName: getTableName(this.metadata),
      Key: createKeyAttributes(this.metadata, partitionKey, sortKey),
    }
  }

  consistentRead(consistentRead: boolean): GetRequest<T> {
    this.params.ConsistentRead = consistentRead
    return this
  }

  returnConsumedCapacity(level: DynamoDB.ReturnConsumedCapacity): GetRequest<T> {
    this.params.ReturnConsumedCapacity = level
    return this
  }

  projectionExpression(...attributesToGet: string[]): GetRequest<T> {
    // tslint:disable-next-line:no-unnecessary-callback-wrapper
    const resolved = attributesToGet.map(a => resolveAttributeNames(a))
    this.params.ProjectionExpression = resolved.map(attr => attr.placeholder).join(', ')
    objValues(resolved).forEach(r => {
      this.params.ExpressionAttributeNames = { ...this.params.ExpressionAttributeNames, ...r.attributeNames }
    })
    return this
  }

  execFullResponse(): Observable<GetResponse<T>> {
    this.logger.debug('request', this.params)
    return this.dynamoRx.getItem(this.params).pipe(
      tap(response => this.logger.debug('response', response)),
      map(getItemResponse => {
        const response: GetResponse<T> = <any>{ ...getItemResponse }

        if (getItemResponse.Item) {
          response.Item = fromDb(<Attributes<T>>getItemResponse.Item, this.modelClazz)
        } else {
          response.Item = null
        }

        return response
      }),
      tap(response => this.logger.debug('mapped item', response.Item)),
    )
  }

  exec(): Observable<T | null> {
    this.logger.debug('request', this.params)
    return this.dynamoRx.getItem(this.params).pipe(
      tap(response => this.logger.debug('response', response)),
      map(response => {
        if (response.Item) {
          return fromDb(<Attributes<T>>response.Item, this.modelClazz)
        } else {
          return null
        }
      }),
      tap(item => this.logger.debug('mapped item', item)),
    )
  }
}
