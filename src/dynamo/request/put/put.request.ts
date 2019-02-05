import * as DynamoDB from 'aws-sdk/clients/dynamodb'
import { promiseTap } from '../../../helper/promise-tap.function'
import { createLogger, Logger } from '../../../logger/logger'
import { toDb } from '../../../mapper/mapper'
import { ModelConstructor } from '../../../model/model-constructor'
import { Omit } from '../../../model/omit.type'
import { DynamoDbWrapper } from '../../dynamo-db-wrapper'
import { createIfNotExistsCondition } from '../../expression/create-if-not-exists-condition.function'
import { WriteRequest } from '../write.request'

type PutRequestReturnT<T> = Omit<PutRequest<T>, 'exec'> & { exec(): Promise<DynamoDB.AttributeMap> }


export class PutRequest<T> extends WriteRequest<T, DynamoDB.PutItemInput, PutRequest<T>> {
  protected readonly logger: Logger

  constructor(dynamoDBWrapper: DynamoDbWrapper, modelClazz: ModelConstructor<T>, item: T) {
    super(dynamoDBWrapper, modelClazz)
    this.logger = createLogger('dynamo.request.PutRequest', modelClazz)
    this.params.Item = toDb(item, this.modelClazz)
  }

  /**
   * Adds a condition expression to the request, which makes sure the item will only be saved if the id does not exist
   * @returns {PutRequest<T>}
   */
  ifNotExists(predicate: boolean = true): PutRequest<T> {
    if (predicate) {
      this.onlyIf(...createIfNotExistsCondition(this.metadata))
    }
    return this
  }

  returnValues(returnValues: 'ALL_OLD'): PutRequestReturnT<T>
  returnValues(returnValues: 'NONE'): PutRequest<T>
  returnValues(returnValues: 'ALL_OLD' | 'NONE'): PutRequest<T> | PutRequestReturnT<T> {
    this.params.ReturnValues = returnValues
    return this
  }

  /*
   * kind a hacky - this is just for typing reasons so Promise<void> is the default return type when not defining a
   * returnValues other than NONE
   *
   * const valueVoid = new DeleteRequest(...).exec()
   * const valueMyModel = new DeleteRequest(...).returnValues('ALL_OLD').exec()
   */
  exec(): Promise<void> {
    return <Promise<void>>super.exec()
  }

  execFullResponse(): Promise<DynamoDB.PutItemOutput> {
    this.logger.debug('request', this.params)
    return this.dynamoDBWrapper.putItem(this.params)
      .then(promiseTap(response => this.logger.debug('response', response)))
  }
}
