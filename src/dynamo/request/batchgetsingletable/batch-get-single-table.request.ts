/**
 * @module store-requests
 */
import * as DynamoDB from '@aws-sdk/client-dynamodb'
import { promiseTap } from '../../../helper/promise-tap.function'
import { randomExponentialBackoffTimer } from '../../../helper/random-exponential-backoff-timer.generator'
import { createLogger, Logger } from '../../../logger/logger'
import { createToKeyFn, fromDb } from '../../../mapper/mapper'
import { Attributes } from '../../../mapper/type/attribute.type'
import { ModelConstructor } from '../../../model/model-constructor'
import { batchGetItemsFetchAll } from '../../batchget/batch-get-utils'
import { BATCH_GET_DEFAULT_TIME_SLOT, BATCH_GET_MAX_REQUEST_ITEM_COUNT } from '../../batchget/batch-get.const'
import { DynamoDbWrapper } from '../../dynamo-db-wrapper'
import { BaseRequest } from '../base.request'
import { addProjectionExpressionParam } from '../helper/add-projection-expression-param.function'
import { BatchGetSingleTableResponse } from './batch-get-single-table.response'

/**
 * Request class for BatchGetItem operation which supports a single model class only.
 */
export class BatchGetSingleTableRequest<T, T2 extends Partial<T> = T> extends BaseRequest<
  T,
  T2,
  DynamoDB.BatchGetItemInput & { RequestItems: NonNullable<DynamoDB.BatchGetItemInput['RequestItems']> },
  BatchGetSingleTableRequest<T, T2>
> {
  private readonly logger: Logger

  constructor(dynamoDBWrapper: DynamoDbWrapper, modelClazz: ModelConstructor<T>, keys: Array<Partial<T>>) {
    super(dynamoDBWrapper, modelClazz)
    this.logger = createLogger('dynamo.request.BatchGetSingleTableRequest', modelClazz)

    if (keys.length > BATCH_GET_MAX_REQUEST_ITEM_COUNT) {
      throw new Error(`you can request at max ${BATCH_GET_MAX_REQUEST_ITEM_COUNT} items per request`)
    }

    this.params.RequestItems = {
      [this.tableName]: {
        Keys: keys.map(createToKeyFn(modelClazz)),
      },
    }
  }

  /**
   * Determines the read consistency model: If set to true, then the operation uses strongly consistent reads; otherwise, the operation uses eventually consistent reads.
   */
  consistentRead(value: boolean = true): this {
    this.params.RequestItems[this.tableName].ConsistentRead = value
    return this
  }

  /**
   * Specifies the list of model attributes to be returned from the table instead of returning the entire document
   * @param attributesToGet List of model attributes to be returned
   */
  projectionExpression(...attributesToGet: Array<keyof T | string>): BatchGetSingleTableRequest<T, Partial<T>> {
    addProjectionExpressionParam(attributesToGet, this.params.RequestItems[this.tableName], this.metadata)
    return this
  }

  /**
   * fetch all entries and return the raw response (without parsing the attributes to js objects)
   * @param backoffTimer when unprocessed keys are returned the next value of backoffTimer is used to determine how many time slots to wait before doing the next request
   * @param throttleTimeSlot the duration of a time slot in ms
   */
  execNoMap(
    backoffTimer = randomExponentialBackoffTimer,
    throttleTimeSlot = BATCH_GET_DEFAULT_TIME_SLOT,
  ): Promise<DynamoDB.BatchGetItemOutput> {
    return this.fetch(backoffTimer, throttleTimeSlot)
  }

  /**
   * fetch all entries and return an object containing the mapped items and the other response data
   * @param backoffTimer when unprocessed keys are returned the next value of backoffTimer is used to determine how many time slots to wait before doing the next request
   * @param throttleTimeSlot the duration of a time slot in ms
   */
  execFullResponse(
    backoffTimer = randomExponentialBackoffTimer,
    throttleTimeSlot = BATCH_GET_DEFAULT_TIME_SLOT,
  ): Promise<BatchGetSingleTableResponse<T2>> {
    return this.fetch(backoffTimer, throttleTimeSlot)
      .then(this.mapResponse)
      .then(promiseTap((response) => this.logger.debug('mapped items', response.Items)))
  }

  /**
   * fetch all entries and return the parsed items
   * @param backoffTimer when unprocessed keys are returned the next value of backoffTimer is used to determine how many time slots to wait before doing the next request
   * @param throttleTimeSlot the duration of a time slot in ms
   */
  exec(backoffTimer = randomExponentialBackoffTimer, throttleTimeSlot = BATCH_GET_DEFAULT_TIME_SLOT): Promise<T2[]> {
    return this.fetch(backoffTimer, throttleTimeSlot)
      .then(this.mapResponse)
      .then((r) => r.Items)
      .then(promiseTap((items) => this.logger.debug('mapped items', items)))
  }

  private mapResponse = (response: DynamoDB.BatchGetItemOutput) => {
    let items: T2[] = []
    if (response.Responses && Object.keys(response.Responses).length && response.Responses[this.tableName]) {
      const mapped: T2[] = response.Responses[this.tableName].map((attributeMap) =>
        fromDb(<Attributes<T2>>attributeMap, <any>this.modelClazz),
      )
      items = mapped
    }
    return {
      Items: items,
      UnprocessedKeys: response.UnprocessedKeys,
      ConsumedCapacity: response.ConsumedCapacity,
    }
  }

  private fetch(backoffTimer = randomExponentialBackoffTimer, throttleTimeSlot = BATCH_GET_DEFAULT_TIME_SLOT) {
    this.logger.debug('request', this.params)
    return batchGetItemsFetchAll(this.dynamoDBWrapper, { ...this.params }, backoffTimer(), throttleTimeSlot).then(
      promiseTap((response) => this.logger.debug('response', response)),
    )
  }
}
