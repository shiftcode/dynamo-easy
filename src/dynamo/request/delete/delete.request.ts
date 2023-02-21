/**
 * @module store-requests
 */
import * as DynamoDB from '@aws-sdk/client-dynamodb'
import { createLogger, Logger } from '../../../logger/logger'
import { createKeyAttributes } from '../../../mapper/mapper'
import { ModelConstructor } from '../../../model/model-constructor'
import { DynamoDbWrapper } from '../../dynamo-db-wrapper'
import { WriteRequest } from '../write.request'

/**
 * Request class for the DeleteItem operation.
 */
export class DeleteRequest<T, T2 = void> extends WriteRequest<
  T,
  T2,
  DynamoDB.DeleteItemInput,
  DynamoDB.DeleteItemOutput,
  DeleteRequest<T, T2>
> {
  protected readonly logger: Logger

  constructor(dynamoDBWrapper: DynamoDbWrapper, modelClazz: ModelConstructor<T>, partitionKey: any, sortKey?: any) {
    super(dynamoDBWrapper, modelClazz)
    this.logger = createLogger('dynamo.request.DeleteRequest', modelClazz)
    this.params.Key = createKeyAttributes(this.metadata, partitionKey, sortKey)
  }

  returnValues(returnValues: 'ALL_OLD'): DeleteRequest<T, T>
  returnValues(returnValues: 'NONE'): DeleteRequest<T, void>
  returnValues(returnValues: 'ALL_OLD' | 'NONE'): DeleteRequest<T, T | void> {
    this.params.ReturnValues = returnValues
    return <any>this
  }

  protected doRequest(params: DynamoDB.DeleteItemInput): Promise<DynamoDB.DeleteItemOutput> {
    return this.dynamoDBWrapper.deleteItem(params)
  }
}
