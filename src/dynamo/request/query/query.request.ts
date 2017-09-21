import { QueryInput } from 'aws-sdk/clients/dynamodb'
import { Observable } from 'rxjs/Observable'
import { Mapper } from '../../../mapper/mapper'
import { ModelConstructor } from '../../../model/model-constructor'
import { DynamoRx } from '../../dynamo-rx'
import { and } from '../../expression/logical-operator/and.function'
import { ParamUtil } from '../../expression/param-util'
import { RequestExpressionBuilder } from '../../expression/request-expression-builder'
import { ConditionExpressionDefinitionFunction } from '../../expression/type/condition-expression-definition-function'
import { ConditionExpression } from '../../expression/type/condition-expression.type'
import { RequestConditionFunction } from '../../expression/type/request-condition-function'
import { RequestSortKeyConditionFunction } from '../../expression/type/sort-key-condition-function'
import { Request } from '../request.model'
import { QueryResponse } from './query.response'

export class QueryRequest<T> extends Request<T, QueryRequest<T>, QueryInput, QueryResponse<T>> {
  constructor(dynamoRx: DynamoRx, modelClazz: ModelConstructor<T>) {
    super(dynamoRx, modelClazz)
  }

  wherePartitionKey(partitionKeyValue: any): QueryRequest<T> {
    let partitionKey: string
    if (this.params.IndexName) {
      const index = this.metaData.getIndex(this.params.IndexName)
      if (index) {
        partitionKey = index.partitionKey
        if (!partitionKey) {
          throw new Error(`there is no parition key defined for index <${this.params.IndexName}>`)
        }
      } else {
        throw new Error(`the index <${this.params.IndexName}> does not exist on model ${this.modelClazz.name}`)
      }
    } else {
      partitionKey = this.metaData.getPartitionKey()
    }

    return RequestExpressionBuilder.addSortKeyCondition<QueryRequest<T>>(partitionKey, this, this.metaData).equals(
      partitionKeyValue
    )
  }

  /**
   * used to define some condition for the range key, use the secondary index to query based on a custom index
   * @returns {RequestConditionFunction<T>}
   */
  whereSortKey(): RequestSortKeyConditionFunction<QueryRequest<T>> {
    let sortKey: string | null
    if (this.params.IndexName) {
      const index = this.metaData.getIndex(this.params.IndexName)
      if (index) {
        if (index.sortKey) {
          sortKey = index.sortKey
        } else {
          throw new Error(`there is no sort key defined for index <${this.params.IndexName}>`)
        }
      } else {
        throw new Error(`the index <${this.params.IndexName}> does not exist on model ${this.modelClazz.name}`)
      }
    } else {
      sortKey = this.metaData.getSortKey()
    }

    if (!sortKey) {
      throw new Error('There was no sort key defined for current schema')
    }

    return RequestExpressionBuilder.addSortKeyCondition(sortKey, this)
  }

  whereProperty(keyName: keyof T): RequestConditionFunction<QueryRequest<T>> {
    return RequestExpressionBuilder.addCondition('FilterExpression', keyName, this, this.metaData)
  }

  where(...conditionDefFns: ConditionExpressionDefinitionFunction[]): QueryRequest<T> {
    const conditions: ConditionExpression[] = conditionDefFns.map(
      (conditionDefFn: ConditionExpressionDefinitionFunction) => {
        return conditionDefFn(undefined, this.metaData)
      }
    )

    const condition = and(...conditions)
    ParamUtil.addExpression('FilterExpression', condition, this.params)
    return this
  }

  /**
   * multiple conditions will be combined using the AND operator by default
   * @param {ConditionExpression[]} conditions
   * @returns {QueryRequest<T>}
   */
  // implementation with overload won't work perfectly with ide support, so we add two different methods
  // property(keyName: keyof T): RequestConditionFunction<QueryRequest<T>>
  // property(...conditionDefFns: ConditionExpressionDefinitionFunction[]): QueryRequest<T>
  //
  // // (keyof T)[] | ConditionExpressionDefinitionFunction[]
  // property(...args: any[]): RequestConditionFunction<QueryRequest<T>> | QueryRequest<T> {
  //   if (args.length === 1 && typeof args[0] === 'string') {
  //
  //   } else {
  //     const conditions: ConditionExpression[] = args.map((conditionDefFn: ConditionExpressionDefinitionFunction) => {
  //       return conditionDefFn(undefined, this.metaData)
  //     })
  //
  //     const condition = and(...conditions)
  //     ParamUtil.addFilterExpression(condition, this.params)
  //     return this
  //   }
  // }

  ascending(): QueryRequest<T> {
    this.params.ScanIndexForward = true
    return this
  }

  descending(): QueryRequest<T> {
    this.params.ScanIndexForward = false
    return this
  }

  execCount(): Observable<number> {
    const params = { ...this.params }
    params.Select = 'COUNT'

    return this.dynamoRx.query(params).map(response => response.Count!)
  }

  execFullResponse(): Observable<QueryResponse<T>> {
    return this.dynamoRx.query(this.params).map(queryResponse => {
      const response: QueryResponse<T> = <any>{ ...queryResponse }
      response.Items = queryResponse.Items!.map(item => Mapper.fromDb(item, this.modelClazz))

      return response
    })
  }

  exec(): Observable<T[]> {
    return this.dynamoRx
      .query(this.params)
      .map(response => response.Items!.map(item => Mapper.fromDb(item, this.modelClazz)))
  }

  execSingle(): Observable<T | null> {
    this.limit(1)

    return this.dynamoRx.query(this.params).map(response => {
      if (response.Count) {
        return Mapper.fromDb(response.Items![0], this.modelClazz)
      } else {
        return null
      }
    })
  }
}
