import * as DynamoDB from 'aws-sdk/clients/dynamodb'
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
   * @param conditionDefFns
   * @example writeRequest.onlyIf( attribute('age').eq(23) )
   * @example writeRequest.onlyIf( or( attribute('age').lt(18), attribute('age').gt(65) ) )
   */
  onlyIf(...conditionDefFns: ConditionExpressionDefinitionFunction[]): R {
    const condition = and(...conditionDefFns)(undefined, this.metadata)
    addExpression('ConditionExpression', condition, this.params)
    return <any>this
  }

  /*
   * The ReturnValues parameter is used by several DynamoDB operations; however,
   * DeleteItem/PutItem/UpdateItem does not recognize any values other than NONE or ALL_OLD.
   */
  returnValues(returnValues: 'NONE' | 'ALL_OLD'): R {
    this.params.ReturnValues = returnValues
    return <R>(<any>this)
  }

  exec(): Promise<void> {
    return this.execFullResponse()
      .then(response => {return})
  }
}
