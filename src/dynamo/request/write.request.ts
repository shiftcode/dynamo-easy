/**
 * @module store-requests
 */
import * as DynamoDB from '@aws-sdk/client-dynamodb'
import { promiseTap } from '../../helper/promise-tap.function'
import { Logger } from '../../logger/logger'
import { fromDb } from '../../mapper/mapper'
import { Attributes } from '../../mapper/type/attribute.type'
import { ModelConstructor } from '../../model/model-constructor'
import { Omit } from '../../model/omit.type'
import { DynamoDbWrapper } from '../dynamo-db-wrapper'
import { and } from '../expression/logical-operator/public.api'
import { addExpression } from '../expression/param-util'
import { addCondition } from '../expression/request-expression-builder'
import {
  RequestConditionFunction,
  RequestConditionFunctionTyped,
} from '../expression/type/condition-expression-definition-chain'
import { ConditionExpressionDefinitionFunction } from '../expression/type/condition-expression-definition-function'
import { StandardRequest } from './standard.request'

// TODO typings check on unused generic
type WriteResponse<O extends DynamoDB.DeleteItemOutput | DynamoDB.PutItemOutput | DynamoDB.UpdateItemOutput, _T> = Omit<
  O,
  'Attributes'
>

/**
 * abstract class for all basic write request classes (DeleteItem, PutItem, UpdateItem
 */
export abstract class WriteRequest<
  T,
  T2,
  I extends DynamoDB.DeleteItemInput | DynamoDB.PutItemInput | DynamoDB.UpdateItemInput,
  O extends DynamoDB.DeleteItemOutput | DynamoDB.PutItemOutput | DynamoDB.UpdateItemOutput,
  R extends WriteRequest<T, T2, I, O, R>,
> extends StandardRequest<T, T2, I, R> {
  protected abstract readonly logger: Logger

  protected constructor(dynamoDBWrapper: DynamoDbWrapper, modelClazz: ModelConstructor<T>) {
    super(dynamoDBWrapper, modelClazz)
  }

  protected abstract doRequest(params: I): Promise<O>

  /**
   * return item collection metrics.
   */
  returnItemCollectionMetrics(returnItemCollectionMetrics: DynamoDB.ReturnItemCollectionMetrics): this {
    this.params.ReturnItemCollectionMetrics = returnItemCollectionMetrics
    return this
  }

  /**
   * add a condition for propertyPath
   * @param attributePath
   */
  onlyIfAttribute<K extends keyof T>(attributePath: K): RequestConditionFunctionTyped<this, T, K>
  onlyIfAttribute(attributePath: string): RequestConditionFunction<this, T>
  onlyIfAttribute<K extends keyof T>(attributePath: K | string): RequestConditionFunctionTyped<this, T, K> {
    return addCondition<this, T, any>('ConditionExpression', attributePath, <any>this, this.metadata)
  }

  /**
   * @example writeRequest.onlyIf( attribute('age').eq(23) )
   * @example writeRequest.onlyIf( or( attribute('age').lt(18), attribute('age').gt(65) ) )
   */
  onlyIf(...conditionDefFns: ConditionExpressionDefinitionFunction[]): this {
    const condition = and(...conditionDefFns)(undefined, this.metadata)
    addExpression('ConditionExpression', condition, this.params)
    return this
  }

  /**
   * @returns { void } if no ReturnValues are requested, { T } if the requested ReturnValues are ALL_OLD|ALL_NEW or {Partial<T>} if the requested ReturnValues are UPDATED_OLD|UPDATED_NEW
   */
  exec(): Promise<T2> {
    /*
     * kind a hacky - this is just for typing reasons so Promise<void> is the default return type when not defining a
     * returnValues other than NONE
     */
    return this.execFullResponse().then((r) => (<any>r).Item)
  }

  /**
   * execute request and return the full response
   */
  execFullResponse(): Promise<WriteResponse<O, T2>> {
    this.logger.debug('request', this.params)
    return this.doRequest(this.params)
      .then(promiseTap((response) => this.logger.debug('response', response)))
      .then((resp) => {
        const attrs = resp.Attributes
        delete resp.Attributes // delete Attributes on response so it will not be on returned value
        const r = <WriteResponse<O, T>>resp
        if (typeof attrs === 'object' && attrs !== null) {
          /*
           * kind a hacky - this is just for typing reasons so Item is default not defined when not defining a
           * returnValues other than NONE
           */
          ;(<any>r).Item = fromDb(<Attributes<T>>attrs, this.modelClazz)
        }
        return r
      })
      .then(promiseTap((resp) => this.logger.debug('mapped response', resp)))
  }

  /**
   * execute request without parsing (mapping) the response attributes to js objects
   */
  execNoMap(): Promise<O> {
    this.logger.debug('request', this.params)
    return this.doRequest(this.params).then(promiseTap((response) => this.logger.debug('response', response)))
  }
}
