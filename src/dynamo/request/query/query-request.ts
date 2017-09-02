import { QueryInput } from 'aws-sdk/clients/dynamodb'
import { Observable } from 'rxjs/Observable'
import { ModelConstructor } from '../../../model/model-constructor'
import { DynamoRx } from '../../dynamo-rx'
import { ConditionBuilder } from '../../expression/condition-builder'
import { RequestRangeKeyConditionFunction } from '../../expression/type/range-key-condition-function'
import { RequestConditionFunction } from '../../expression/type/request-condition-function'
import { Request } from '../request.model'
import { Response } from '../response.model'

// inspired by https://github.com/ryanfitz/vogels/blob/master/lib/query.js
export class QueryRequest<T> extends Request<T, QueryInput> {
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

    return ConditionBuilder.addRangeKeyCondition<QueryRequest<T>>(
      partitionKey,
      this,
      this.metaData.forProperty(partitionKey)
    ).equals(partitionKeyValue)
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

  where(keyName: string): RequestConditionFunction<QueryRequest<T>> {
    return ConditionBuilder.addCondition(keyName, this)
  }

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

  execFullResponse(): Observable<Response<T>> {
    return this.dynamoRx.query(this.params).map(queryResponse => {
      const response: Response<T> = {}
      Object.assign(response, queryResponse)
      response.Items = queryResponse.Items!.map(item => this.mapFromDb(<any>item))

      return response
    })
  }

  exec(): Observable<T[]> {
    return this.dynamoRx.query(this.params).map(response => response.Items!.map(item => this.mapFromDb(<any>item)))
  }

  execSingle(): Observable<T | null> {
    this.limit(1)

    return this.dynamoRx.query(this.params).map(response => {
      if (response.Count) {
        return this.mapFromDb(<any>response.Items![0])
      } else {
        return null
      }
    })
  }
}
