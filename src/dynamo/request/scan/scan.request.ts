/**
 * @module store-requests
 */
import * as DynamoDB from '@aws-sdk/client-dynamodb'
import { createLogger, Logger } from '../../../logger/logger'
import { ModelConstructor } from '../../../model/model-constructor'
import { DynamoDbWrapper } from '../../dynamo-db-wrapper'
import { ReadManyRequest } from '../read-many.request'
import { ScanResponse } from './scan.response'

/**
 * Request class for the Scan operation.
 */
export class ScanRequest<T, T2 = T> extends ReadManyRequest<
  T,
  T2,
  DynamoDB.ScanInput,
  DynamoDB.ScanOutput,
  ScanResponse<T2>,
  ScanRequest<T, T2>,
  ScanRequest<T, Partial<T>>
> {
  protected readonly logger: Logger

  constructor(dynamoDBWrapper: DynamoDbWrapper, modelClazz: ModelConstructor<T>) {
    super(dynamoDBWrapper, modelClazz)
    this.logger = createLogger('dynamo.request.ScanRequest', modelClazz)
  }

  protected doRequest(params: DynamoDB.ScanInput): Promise<DynamoDB.ScanOutput> {
    return this.dynamoDBWrapper.scan(params)
  }
}
