import { QueryInput, QueryOutput } from 'aws-sdk/clients/dynamodb'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { fetchAll } from '../../../helper'
import { Attributes, fromDb } from '../../../mapper'
import { ModelConstructor } from '../../../model'
import { DynamoRx } from '../../dynamo-rx'
import { and } from '../../expression'
import { addExpression } from '../../expression/param-util'
import { addCondition, addSortKeyCondition } from '../../expression/request-expression-builder'
import { ConditionExpressionDefinitionFunction } from '../../expression/type/condition-expression-definition-function'
import { RequestConditionFunction } from '../../expression/type/request-condition-function'
import { RequestSortKeyConditionFunction } from '../../expression/type/sort-key-condition-function'
import { Pageable } from '../../paged'
import { Request } from '../request.model'
import { QueryResponse } from './query.response'

export class QueryRequest<T> extends Request<T, QueryRequest<T>, QueryInput, QueryResponse<T>>
  implements Pageable<T, QueryRequest<T>, QueryResponse<T>> {
  constructor(dynamoRx: DynamoRx, modelClazz: ModelConstructor<T>, tableName: string) {
    super(dynamoRx, modelClazz, tableName)
  }

  wherePartitionKey(partitionKeyValue: any): QueryRequest<T> {
    let partitionKey: string
    if (this.params.IndexName) {
      const index = this.metaData.getIndex(this.params.IndexName)
      if (index) {
        partitionKey = <string>index.partitionKey
        if (!partitionKey) {
          throw new Error(`there is no parition key defined for index <${this.params.IndexName}>`)
        }
      } else {
        throw new Error(`the index <${this.params.IndexName}> does not exist on model ${this.modelClazz.name}`)
      }
    } else {
      partitionKey = <string>this.metaData.getPartitionKey()
    }

    return addSortKeyCondition<QueryRequest<T>>(partitionKey, this, this.metaData).equals(partitionKeyValue)
  }

  /**
   * used to define some condition for the sort key, use the secondary index to query based on a custom index
   * @returns {RequestConditionFunction<T>}
   */
  whereSortKey(): RequestSortKeyConditionFunction<QueryRequest<T>> {
    let sortKey: string | null
    if (this.params.IndexName) {
      const index = this.metaData.getIndex(this.params.IndexName)
      if (index) {
        if (index.sortKey) {
          sortKey = <string>index.sortKey
        } else {
          throw new Error(`there is no sort key defined for index <${this.params.IndexName}>`)
        }
      } else {
        throw new Error(`the index <${this.params.IndexName}> does not exist on model ${this.modelClazz.name}`)
      }
    } else {
      sortKey = <string>this.metaData.getSortKey()
    }

    if (!sortKey) {
      throw new Error('There was no sort key defined for current schema')
    }

    return addSortKeyCondition(sortKey, this, this.metaData)
  }

  // TODO TYPING how can we improve the typing to define the accepted value for condition function (see
  // update2.function)
  whereAttribute(attributePath: keyof T): RequestConditionFunction<QueryRequest<T>> {
    return addCondition('FilterExpression', <string>attributePath, this, this.metaData)
  }

  where(...conditionDefFns: ConditionExpressionDefinitionFunction[]): QueryRequest<T> {
    const condition = and(...conditionDefFns)(undefined, this.metaData)
    addExpression('FilterExpression', condition, this.params)
    return this
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

    return this.dynamoRx.query(params).pipe(map(response => response.Count || 0))
  }

  execFullResponse(): Observable<QueryResponse<T>> {
    return this.dynamoRx.query(this.params).pipe(
      map(queryResponse => {
        const response: QueryResponse<T> = <any>{ ...queryResponse }
        response.Items = (queryResponse.Items || []).map(item => fromDb(<Attributes>item, this.modelClazz))

        return response
      }),
    )
  }

  exec(): Observable<T[]> {
    return this.dynamoRx
      .query(this.params)
      .pipe(map(response => (response.Items || []).map(item => fromDb(<Attributes>item, this.modelClazz))))
  }

  execNoMap(): Observable<QueryOutput> {
    return this.dynamoRx.query(this.params)
  }

  execSingle(): Observable<T | null> {
    this.limit(1)

    return this.dynamoRx
      .query(this.params)
      .pipe(
        map(response =>
          response.Items && response.Items.length ? fromDb(<Attributes>response.Items[0], this.modelClazz) : null,
        ),
      )
  }

  /**
   * fetches all pages. may uses all provisionedOutput, therefore for client side use cases rather use pagedDatasource (exec)
   */
  execFetchAll(): Observable<T[]> {
    return fetchAll(this)
  }
}
