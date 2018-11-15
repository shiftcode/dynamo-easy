import { QueryInput, QueryOutput } from 'aws-sdk/clients/dynamodb'
import { Observable } from 'rxjs'
import { map, tap } from 'rxjs/operators'
import { fetchAll } from '../../../helper'
import { createLogger, Logger } from '../../../logger/logger'
import { Mapper } from '../../../mapper/mapper'
import { Attributes } from '../../../mapper/type/attribute.type'
import { ModelConstructor } from '../../../model/model-constructor'
import { DynamoRx } from '../../dynamo-rx'
import { and } from '../../expression/logical-operator/and.function'
import { ParamUtil } from '../../expression/param-util'
import { RequestExpressionBuilder } from '../../expression/request-expression-builder'
import { ConditionExpressionDefinitionFunction } from '../../expression/type/condition-expression-definition-function'
import { RequestConditionFunction } from '../../expression/type/request-condition-function'
import { RequestSortKeyConditionFunction } from '../../expression/type/sort-key-condition-function'
import { Pageable } from '../../paged'
import { Request } from '../request.model'
import { QueryResponse } from './query.response'

export class QueryRequest<T> extends Request<T, QueryRequest<T>, QueryInput, QueryResponse<T>>
  implements Pageable<T, QueryRequest<T>, QueryResponse<T>> {
  private readonly logger: Logger

  constructor(dynamoRx: DynamoRx, modelClazz: ModelConstructor<T>, tableName: string) {
    super(dynamoRx, modelClazz, tableName)
    this.logger = createLogger('dynamo.request.QueryRequest', modelClazz)
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

    return RequestExpressionBuilder.addSortKeyCondition<QueryRequest<T>>(partitionKey, this, this.metaData).equals(
      partitionKeyValue
    )
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

    return RequestExpressionBuilder.addSortKeyCondition(sortKey, this, this.metaData)
  }

  // TODO TYPING how can we improve the typing to define the accepted value for condition function (see
  // update2.function)
  whereAttribute(attributePath: keyof T): RequestConditionFunction<QueryRequest<T>> {
    return RequestExpressionBuilder.addCondition('FilterExpression', <string>attributePath, this, this.metaData)
  }

  where(...conditionDefFns: ConditionExpressionDefinitionFunction[]): QueryRequest<T> {
    const condition = and(...conditionDefFns)(undefined, this.metaData)
    ParamUtil.addExpression('FilterExpression', condition, this.params)
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

    this.logger.debug('count request', params)
    return this.dynamoRx.query(params).pipe(
      tap(response => this.logger.debug('response', response)),
      map(response => response.Count!),
      tap(count => this.logger.debug('count', count))
    )
  }

  execFullResponse(): Observable<QueryResponse<T>> {
    this.logger.debug('request', this.params)
    return this.dynamoRx.query(this.params).pipe(
      tap(response => this.logger.debug('response', response)),
      map(queryResponse => {
        const response: QueryResponse<T> = <any>{ ...queryResponse }
        response.Items = queryResponse.Items!.map(item => Mapper.fromDb(<Attributes>item, this.modelClazz))

        return response
      }),
      tap(response => this.logger.debug('mapped items', response.Items))
    )
  }

  exec(): Observable<T[]> {
    this.logger.debug('request', this.params)
    return this.dynamoRx.query(this.params).pipe(
      tap(response => this.logger.debug('response', response)),
      map(response => response.Items!.map(item => Mapper.fromDb(<Attributes>item, this.modelClazz))),
      tap(items => this.logger.debug('mapped items', items))
    )
  }

  execNoMap(): Observable<QueryOutput> {
    this.logger.debug('request (noMap)', this.params)
    return this.dynamoRx.query(this.params).pipe(tap(response => this.logger.debug('response', response)))
  }

  execSingle(): Observable<T | null> {
    this.limit(1)
    this.logger.debug('single request', this.params)
    return this.dynamoRx.query(this.params).pipe(
      tap(response => this.logger.debug('response', response)),
      map(response => {
        if (response.Count) {
          return Mapper.fromDb(<Attributes>response.Items![0], this.modelClazz)
        } else {
          return null
        }
      }),
      tap(item => this.logger.debug('mapped item', item))
    )
  }

  /**
   * fetches all pages. may uses all provisionedOutput, therefore for client side use cases rather use pagedDatasource (exec)
   */
  execFetchAll(): Observable<T[]> {
    return fetchAll(this)
  }
}
