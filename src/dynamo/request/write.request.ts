import * as DynamoDB from 'aws-sdk/clients/dynamodb'
import { promiseTap } from '../../helper/promise-tap.function'
import { Logger } from '../../logger/logger'
import { fromDb } from '../../mapper/mapper'
import { Attributes } from '../../mapper/type/attribute.type'
import { ModelConstructor } from '../../model/model-constructor'
import { DynamoDbWrapper } from '../dynamo-db-wrapper'
import { and } from '../expression/logical-operator/public.api'
import { addExpression } from '../expression/param-util'
import { addCondition } from '../expression/request-expression-builder'
import { RequestConditionFunction } from '../expression/type/condition-expression-definition-chain'
import { ConditionExpressionDefinitionFunction } from '../expression/type/condition-expression-definition-function'
import { StandardRequest } from './standard.request'

/**
 * base class for all basic write request classes (DeleteItem, PutItem, UpdateItem
 */
export abstract class WriteRequest<T,
  I extends DynamoDB.DeleteItemInput | DynamoDB.PutItemInput | DynamoDB.UpdateItemInput,
  R extends WriteRequest<T, I, R>> extends StandardRequest<T, I, R> {

  protected abstract readonly logger: Logger


  protected constructor(dynamoDBWrapper: DynamoDbWrapper, modelClazz: ModelConstructor<T>) {
    super(dynamoDBWrapper, modelClazz)
  }

  returnItemCollectionMetrics(returnItemCollectionMetrics: DynamoDB.ReturnItemCollectionMetrics): R {
    this.params.ReturnItemCollectionMetrics = returnItemCollectionMetrics
    return <R>(<any>this)
  }

  onlyIfAttribute<K extends keyof T>(attributePath: K): RequestConditionFunction<R, T, K> {
    return addCondition<R, T, K>('ConditionExpression', attributePath, <any>this, this.metadata)
  }

  /**
   * @example writeRequest.onlyIf( attribute('age').eq(23) )
   * @example writeRequest.onlyIf( or( attribute('age').lt(18), attribute('age').gt(65) ) )
   */
  onlyIf(...conditionDefFns: ConditionExpressionDefinitionFunction[]): R {
    const condition = and(...conditionDefFns)(undefined, this.metadata)
    addExpression('ConditionExpression', condition, this.params)
    return <any>this
  }

  /**
   * @returns { void } if no ReturnValues are requested, { T } if the requested ReturnValues are ALL_OLD|ALL_NEW or {Partial<T>} if the requested ReturnValues are UPDATED_OLD|UPDATED_NEW
   */
  exec(): Promise<T | undefined> {
    return this.execFullResponse()
      .then(response => {
        if ('Attributes' in response && typeof response.Attributes === 'object' && response.Attributes !== null) {
          return fromDb(<Attributes<T>>response.Attributes, this.modelClazz)
        }
        return
      })
      .then(promiseTap(item => {
        if (item) {
          this.logger.debug('mapped item', item)
        } else {
          this.logger.debug('no return values to map')
        }
      }))
  }
}
