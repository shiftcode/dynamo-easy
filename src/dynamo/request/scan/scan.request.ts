import * as DynamoDB from 'aws-sdk/clients/dynamodb'
import { createLogger, Logger } from '../../../logger/logger'
import { ModelConstructor } from '../../../model'
import { DynamoPromisified } from '../../dynamo-promisified'
import { ReadManyRequest } from '../read-many.request'
import { ScanResponse } from './scan.response'

export class ScanRequest<T> extends ReadManyRequest<T,
  DynamoDB.ScanInput,
  DynamoDB.ScanOutput,
  ScanResponse<T>,
  ScanRequest<T>> {
  protected readonly logger: Logger

  constructor(dynamoRx: DynamoPromisified, modelClazz: ModelConstructor<T>) {
    super(dynamoRx, modelClazz)
    this.logger = createLogger('dynamo.request.ScanRequest', modelClazz)
  }

  protected doRequest(params: DynamoDB.ScanInput): Promise<DynamoDB.ScanOutput> {
    return this.dynamoRx.scan(params)
  }
}
