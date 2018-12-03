import { ScanInput, ScanOutput } from 'aws-sdk/clients/dynamodb'
import { Observable } from 'rxjs'
import { map, tap } from 'rxjs/operators'
import { createLogger, Logger } from '../../../logger/logger'
import { Attributes, fromDb } from '../../../mapper'
import { ModelConstructor } from '../../../model'
import { DynamoRx } from '../../dynamo-rx'
import { Request } from '../request.model'
import { ScanResponse } from './scan.response'

export class ScanRequest<T> extends Request<T, ScanRequest<T>, ScanInput, ScanResponse<T>> {
  private readonly logger: Logger

  constructor(dynamoRx: DynamoRx, modelClazz: ModelConstructor<T>) {
    super(dynamoRx, modelClazz)
    this.logger = createLogger('dynamo.request.ScanRequest', modelClazz)
  }

  private mapFromDb = (output: ScanOutput) => {
    const response: ScanResponse<T> = <any>{ ...output }
    if (output.Items) {
      response.Items = output.Items.map(item => fromDb(<Attributes<T>>item, this.modelClazz))
    }
    return response
  }

  execNoMap(): Observable<ScanOutput> {
    this.logger.debug('request (noMap)', this.params)
    return this.dynamoRx.scan(this.params)
      .pipe(tap(response => this.logger.debug('response', response)))
  }

  execFullResponse(): Observable<ScanResponse<T>> {
    this.logger.debug('request', this.params)
    return this.dynamoRx.scan(this.params).pipe(
      tap(response => this.logger.debug('response', response)),
      map(this.mapFromDb),
      tap(response => this.logger.debug('mapped items', response.Items)),
    )
  }

  exec(): Observable<T[]> {
    this.logger.debug('request', this.params)
    return this.dynamoRx.scan(this.params).pipe(
      tap(response => this.logger.debug('response', response)),
      map(this.mapFromDb),
      map(r => r.Items),
      tap(items => this.logger.debug('mapped items', items)),
    )
  }

  execSingle(): Observable<T | null> {
    const params = {
      ...this.params,
      Limit: 1,
    }

    this.logger.debug('single request', params)
    return this.dynamoRx.scan(this.params).pipe(
      tap(response => this.logger.debug('response', response)),
      map(this.mapFromDb),
      map(r => r.Items && r.Items.length ? r.Items[0] : null),
      tap(item => this.logger.debug('mapped item', item)),
    )
  }

  execCount(): Observable<number> {
    const params = {
      ...this.params,
      Select: 'COUNT',
    }
    this.logger.debug('count request', params)
    return this.dynamoRx.scan(params).pipe(
      tap(response => this.logger.debug('response', response)),
      map(response => response.Count || 0),
      tap(count => this.logger.debug('count', count)),
    )
  }

}
