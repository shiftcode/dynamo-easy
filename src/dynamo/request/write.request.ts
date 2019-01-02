import { DeleteItemInput, PutItemInput, ReturnItemCollectionMetrics, UpdateItemInput } from 'aws-sdk/clients/dynamodb'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { ModelConstructor } from '../../model'
import { DynamoRx } from '../dynamo-rx'
import { RequestConditionFunction } from '../expression'
import { and } from '../expression/logical-operator'
import { addExpression } from '../expression/param-util'
import { addCondition } from '../expression/request-expression-builder'
import { ConditionExpressionDefinitionFunction } from '../expression/type'
import { StandardRequest } from './standard.request'

/**
 * base class for all basic write request classes (DeleteItem, PutItem, UpdateItem
 */
export abstract class WriteRequest<T,
  I extends DeleteItemInput | PutItemInput | UpdateItemInput,
  R extends WriteRequest<T, I, R>> extends StandardRequest<T, I, R> {
  protected constructor(dynamoRx: DynamoRx, modelClazz: ModelConstructor<T>) {
    super(dynamoRx, modelClazz)
  }

  returnItemCollectionMetrics(returnItemCollectionMetrics: ReturnItemCollectionMetrics): R {
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

  exec(): Observable<void> {
    return this.execFullResponse().pipe(
      map(response => {
        return
      }),
    )
  }
}
