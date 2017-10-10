import { PutItemOutput, ReturnConsumedCapacity, ReturnItemCollectionMetrics } from 'aws-sdk/clients/dynamodb'
import { Observable } from 'rxjs/Observable'
import { Mapper } from '../../../mapper/mapper'
import { ModelConstructor } from '../../../model/model-constructor'
import { DynamoRx } from '../../dynamo-rx'
import { and } from '../../expression/logical-operator/and.function'
import { ParamUtil } from '../../expression/param-util'
import { RequestExpressionBuilder } from '../../expression/request-expression-builder'
import { ConditionExpressionDefinitionFunction } from '../../expression/type/condition-expression-definition-function'
import { Expression } from '../../expression/type/expression.type'
import { RequestConditionFunction } from '../../expression/type/request-condition-function'
import { BaseRequest } from '../base.request'

export class PutRequest<T> extends BaseRequest<T, any> {
  constructor(dynamoRx: DynamoRx, modelClazz: ModelConstructor<T>, tableName: string, item: T) {
    super(dynamoRx, modelClazz, tableName)
    this.params.Item = Mapper.toDb(item, this.modelClazz)
  }

  /**
   * Adds a condition expression to the request, which makes sure the item will only be saved if the id does not exist
   * @returns {PutRequest<T>}
   */
  ifNotExists(predicate?: boolean): PutRequest<T> {
    // FIXME should we check for sort key too?
    if (predicate === undefined || (predicate !== undefined && predicate === true)) {
      this.whereAttribute(this.metaData.getPartitionKey()).null()
    }

    return this
  }

  returnConsumedCapacity(level: ReturnConsumedCapacity): PutRequest<T> {
    this.params.ReturnConsumedCapacity = level
    return this
  }

  returnItemCollectionMetrics(returnItemCollectionMetrics: ReturnItemCollectionMetrics): PutRequest<T> {
    this.params.ReturnItemCollectionMetrics = returnItemCollectionMetrics
    return this
  }

  /*
   * The ReturnValues parameter is used by several DynamoDB operations,
   * however, PutItem does not recognize any values other than NONE or ALL_OLD.
   */
  returnValues(returnValues: 'NONE' | 'ALL_OLD'): PutRequest<T> {
    this.params.ReturnValues = returnValues
    return this
  }

  whereAttribute(attributePath: keyof T): RequestConditionFunction<PutRequest<T>> {
    return RequestExpressionBuilder.addCondition('ConditionExpression', attributePath, this, this.metaData)
  }

  where(...conditionDefFns: ConditionExpressionDefinitionFunction[]): PutRequest<T> {
    const condition = and(...conditionDefFns)(undefined, this.metaData)
    ParamUtil.addExpression('ConditionExpression', condition, this.params)
    return this
  }

  execFullResponse(): Observable<PutItemOutput> {
    return this.dynamoRx.putItem(this.params)
  }

  exec(): Observable<void> {
    return this.dynamoRx.putItem(this.params).map(response => {
      return
    })
  }
}
