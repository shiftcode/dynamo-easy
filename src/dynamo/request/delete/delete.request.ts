/**
 * @module store-requests
 */
import * as DynamoDB from 'aws-sdk/clients/dynamodb'
import { createLogger, Logger } from '../../../logger/logger'
import { createKeyAttributes } from '../../../mapper/mapper'
import { ModelConstructor } from '../../../model/model-constructor'
import { Omit } from '../../../model/omit.type'
import { DynamoDbWrapper } from '../../dynamo-db-wrapper'
import { WriteRequest } from '../write.request'
import { DeleteResponse } from './delete.response'

type DeleteRequestReturnT<T> = Omit<Omit<DeleteRequest<T>, 'exec'>,'execFullResponse'> & {
  exec(): Promise<T>
  execFullResponse(): Promise<DeleteResponse<T>>
}

/**
 * Request class for the DeleteItem operation.
 */
export class DeleteRequest<T> extends WriteRequest<T, DynamoDB.DeleteItemInput, DynamoDB.DeleteItemOutput, DeleteRequest<T>> {
  protected readonly logger: Logger

  constructor(dynamoDBWrapper: DynamoDbWrapper, modelClazz: ModelConstructor<T>, partitionKey: any, sortKey?: any) {
    super(dynamoDBWrapper, modelClazz)
    this.logger = createLogger('dynamo.request.DeleteRequest', modelClazz)
    this.params.Key = createKeyAttributes(this.metadata, partitionKey, sortKey)
  }


  returnValues(returnValues: 'ALL_OLD'): DeleteRequestReturnT<T>
  returnValues(returnValues: 'NONE'): DeleteRequest<T>
  returnValues(returnValues: 'ALL_OLD' | 'NONE'): DeleteRequest<T> | DeleteRequestReturnT<T> {
    this.params.ReturnValues = returnValues
    return this
  }

  protected doRequest(params: DynamoDB.DeleteItemInput): Promise<DynamoDB.DeleteItemOutput> {
    return this.dynamoDBWrapper.deleteItem(params)
  }
}
