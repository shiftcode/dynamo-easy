import { ScanInput, ScanOutput } from 'aws-sdk/clients/dynamodb'
import { Observable } from 'rxjs'
import { createLogger, Logger } from '../../../logger/logger'
import { ModelConstructor } from '../../../model'
import { DynamoRx } from '../../dynamo-rx'
import { ReadManyRequest } from '../read-many.request'
import { ScanResponse } from './scan.response'

export class ScanRequest<T> extends ReadManyRequest<T, ScanInput, ScanOutput, ScanResponse<T>, ScanRequest<T>> {
  protected readonly logger: Logger

  constructor(dynamoRx: DynamoRx, modelClazz: ModelConstructor<T>) {
    super(dynamoRx, modelClazz)
    this.logger = createLogger('dynamo.request.ScanRequest', modelClazz)
  }

  protected doRequest(params: ScanInput): Observable<ScanOutput> {
    return this.dynamoRx.scan(params)
  }

}
