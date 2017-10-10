import { QueryInput, QueryOutput } from 'aws-sdk/clients/dynamodb'
import moment from 'moment-es6'
import { Observable } from 'rxjs/Observable'
import { getTableName } from '../../../../test/helper/get-table-name.function'
import { ComplexModel } from '../../../../test/models/complex.model'
import { INDEX_ACTIVE_CREATED_AT, ModelWithABunchOfIndexes } from '../../../../test/models/model-with-indexes.model'
import { DynamoRx } from '../../dynamo-rx'
import { attribute } from '../../expression/logical-operator/attribute.function'
import { QueryRequest } from './query.request'

export const DYNAMO_RX_MOCK: DynamoRx = <DynamoRx>{
  query(params: QueryInput): Observable<QueryOutput> {
    // TODO bring back log statement
    // debug.log('params', params)
    return Observable.of({})
  },
}

describe('query request', () => {
  describe('defines correct params', () => {
    let request: QueryRequest<ComplexModel>

    beforeEach(() => {
      request = new QueryRequest(<any>null, ComplexModel, getTableName(ComplexModel))
    })

    it('defaults should be defined', () => {
      expect(request.params.TableName).toBe('complex_model')
      expect(request.params.Limit).toBe(QueryRequest.DEFAULT_LIMIT)
      expect(Object.keys(request.params).length).toBe(2)
    })

    it('Limit', () => {
      request.limit(5)
      expect(request.params.Limit).toBe(5)
    })
  })

  describe('indexes', () => {
    it('simple', () => {
      const request = new QueryRequest(<any>null, ModelWithABunchOfIndexes)

      const now = moment()

      request
        .index(INDEX_ACTIVE_CREATED_AT)
        .wherePartitionKey(true)
        .whereSortKey()
        .lt(now)

      expect(request.params.IndexName).toBe(INDEX_ACTIVE_CREATED_AT)

      expect(request.params.KeyConditionExpression).toBe('#active = :active AND #createdAt < :createdAt')
      expect(request.params.ExpressionAttributeNames).toEqual({ '#active': 'active', '#createdAt': 'createdAt' })
      expect(request.params.ExpressionAttributeValues).toEqual({
        ':active': { BOOL: true },
        ':createdAt': {
          S: now
            .clone()
            .utc()
            .format(),
        },
      })
    })
  })

  describe('filter expression', () => {
    it('simple', () => {
      const request = new QueryRequest(<any>null, ComplexModel)

      request.whereAttribute('active').eq(true)
      expect(request.params.FilterExpression).toBe('#active = :active')

      expect(request.params.ExpressionAttributeNames).toBeDefined()
      expect(Object.keys(request.params.ExpressionAttributeNames).length).toBe(1)
      expect(request.params.ExpressionAttributeNames['#active']).toBe('isActive')

      expect(request.params.ExpressionAttributeValues).toBeDefined()
      expect(Object.keys(request.params.ExpressionAttributeValues).length).toBe(1)
      expect(request.params.ExpressionAttributeValues[':active']).toEqual({ BOOL: true })
    })

    it('complex', () => {
      const request = new QueryRequest(<any>null, ComplexModel)

      request.where(attribute<ComplexModel>('active').eq(true), attribute('creationDate').lt(moment()))

      const params = request.params
      expect(params.FilterExpression).toBe('(#active = :active AND #creationDate < :creationDate)')
    })
  })

  describe('calls endpoint with correct params', () => {
    const dynamoRx: DynamoRx = DYNAMO_RX_MOCK as DynamoRx
    let querySpy

    let request: QueryRequest<ComplexModel>

    beforeEach(() => {
      request = new QueryRequest(<any>null, ComplexModel)
      querySpy = spyOn(dynamoRx, 'query').and.callThrough()
    })
  })
})
