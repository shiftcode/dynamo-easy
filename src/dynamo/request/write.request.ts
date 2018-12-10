import { DeleteItemInput, PutItemInput, ReturnItemCollectionMetrics, UpdateItemInput } from 'aws-sdk/clients/dynamodb'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { ModelConstructor } from '../../model'
import { DynamoRx } from '../dynamo-rx'
import { and } from '../expression/logical-operator'
import { addExpression } from '../expression/param-util'
import { addCondition } from '../expression/request-expression-builder'
import { ConditionExpressionDefinitionFunction, RequestConditionFunction } from '../expression/type'
import { StandardRequest } from './standard.request'

export abstract class WriteRequest<
  T,
  I extends DeleteItemInput | PutItemInput | UpdateItemInput,
  R extends WriteRequest<T, I, R>
> extends StandardRequest<T, I, R> {
  protected constructor(dynamoRx: DynamoRx, modelClazz: ModelConstructor<T>) {
    super(dynamoRx, modelClazz)
  }

  returnItemCollectionMetrics(returnItemCollectionMetrics: ReturnItemCollectionMetrics): R {
    this.params.ReturnItemCollectionMetrics = returnItemCollectionMetrics
    return <R>(<any>this)
  }

  onlyIfAttribute(attributePath: keyof T): RequestConditionFunction<R> {
    return addCondition<R>('ConditionExpression', <string>attributePath, <any>this, this.metadata)
  }

  /**
   * @param conditionDefFns
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
