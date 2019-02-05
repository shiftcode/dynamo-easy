import * as DynamoDB from 'aws-sdk/clients/dynamodb'
import { promiseTap } from '../../../helper/promise-tap.function'
import { createLogger, Logger } from '../../../logger/logger'
import { createKeyAttributes } from '../../../mapper/mapper'
import { ModelConstructor } from '../../../model/model-constructor'
import { Omit } from '../../../model/omit.type'
import { DynamoDbWrapper } from '../../dynamo-db-wrapper'
import { WriteRequest } from '../write.request'

type DeleteRequestReturnT<T> = Omit<DeleteRequest<T>, 'exec'> & { exec(): Promise<T> }

export class DeleteRequest<T> extends WriteRequest<T, DynamoDB.DeleteItemInput, DeleteRequest<T>> {
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

  execFullResponse(): Promise<DynamoDB.DeleteItemOutput> {
    this.logger.debug('request', this.params)
    return this.dynamoDBWrapper.deleteItem(this.params)
      .then(promiseTap(response => this.logger.debug('response', response)))
  }
}
