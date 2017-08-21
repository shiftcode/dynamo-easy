import { QueryInput } from 'aws-sdk/clients/dynamodb'
import * as _ from 'lodash'
import { Observable } from 'rxjs/Observable'
import { Metadata } from '../../decorator/metadata'
import { SecondaryIndex } from '../../decorator/model.decorator'
import { DynamoRx } from '../../dynamo/dynamo-rx'
import { ModelConstructor } from '../../model/model-constructor'
import { Request } from '../request.model'
import { Response } from '../response.model'
import { ConditionBuilder } from '../utils/condition-builder'
import { ConditionFunction } from '../utils/condition-function'
import { RangeKeyConditionFunction } from '../utils/range-key-condition-function'

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

    return ConditionBuilder.addKeyCondition<QueryRequest<T>>(
      partitionKey,
      this,
      this.metaData.forProperty(partitionKey)
    ).equals(partitionKeyValue)
  }

  /**
   * used to define some condition for the range key, use the secondary index to query based on a custom index
   * @returns {ConditionFunction<T>}
   */
  whereSortKey(): RangeKeyConditionFunction<QueryRequest<T>> {
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

    return ConditionBuilder.addKeyCondition(sortKey, this)
  }

  where(keyName: string): ConditionFunction<QueryRequest<T>> {
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
    const params = _.clone(this.params)
    params.Select = 'COUNT'

    return this.dynamoRx.query(params).map(response => response.Count!)
  }

  execNoMap(): Observable<Response<T>> {
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

  execSingle(): Observable<T> {
    this.limit(1)

    return this.dynamoRx.query(this.params).map(response => this.mapFromDb(<any>response.Items![0]))
  }
}
