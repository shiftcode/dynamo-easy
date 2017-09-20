import { QueryInput } from 'aws-sdk/clients/dynamodb'
import { Observable } from 'rxjs/Observable'
import { Mapper } from '../../../mapper/mapper'
import { ModelConstructor } from '../../../model/model-constructor'
import { DynamoRx } from '../../dynamo-rx'
import { ConditionBuilder } from '../../expression/condition-builder'
import { and } from '../../expression/logical-operator/and'
import { ConditionDefFn } from '../../expression/logical-operator/property'
import { ParamUtil } from '../../expression/param-util'
import { Condition } from '../../expression/type/condition.type'
import { RequestRangeKeyConditionFunction } from '../../expression/type/range-key-condition-function'
import { RequestConditionFunction } from '../../expression/type/request-condition-function'
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

    return ConditionBuilder.addRangeKeyCondition<QueryRequest<T>>(partitionKey, this, this.metaData).equals(
      partitionKeyValue
    )
  }

  /**
   * used to define some condition for the range key, use the secondary index to query based on a custom index
   * @returns {RequestConditionFunction<T>}
   */
  whereSortKey(): RequestRangeKeyConditionFunction<QueryRequest<T>> {
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

    return ConditionBuilder.addRangeKeyCondition(sortKey, this)
  }

  whereProperty(keyName: keyof T): RequestConditionFunction<QueryRequest<T>> {
    return ConditionBuilder.addCondition(keyName, this, this.metaData)
  }

  where(...conditionDefFns: ConditionDefFn[]): QueryRequest<T> {
    const conditions: Condition[] = conditionDefFns.map((conditionDefFn: ConditionDefFn) => {
      return conditionDefFn(undefined, this.metaData)
    })

    const condition = and(...conditions)
    ParamUtil.addFilterExpression(condition, this.params)
    return this
  }

  /**
   * multiple conditions will be combined using the AND operator by default
   * @param {Condition[]} conditions
   * @returns {QueryRequest<T>}
   */
  // implementation with overload won't work perfectly with ide support, so we add two different methods
  // where(keyName: keyof T): RequestConditionFunction<QueryRequest<T>>
  // where(...conditionDefFns: ConditionDefFn[]): QueryRequest<T>
  //
  // // (keyof T)[] | ConditionDefFn[]
  // where(...args: any[]): RequestConditionFunction<QueryRequest<T>> | QueryRequest<T> {
  //   if (args.length === 1 && typeof args[0] === 'string') {
  //
  //   } else {
  //     const conditions: Condition[] = args.map((conditionDefFn: ConditionDefFn) => {
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
