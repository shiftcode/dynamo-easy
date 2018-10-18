import { QueryInput, QueryOutput } from 'aws-sdk/clients/dynamodb'
import * as moment from 'moment'
import { Observable, of } from 'rxjs'
import { getTableName } from '../../../../test/helper/get-table-name.function'
import { ComplexModel } from '../../../../test/models/complex.model'
import {
  CustomId,
  ModelWithCustomMapperForSortKeyModel,
} from '../../../../test/models/model-with-custom-mapper-for-sort-key.model'
import { INDEX_ACTIVE_CREATED_AT, ModelWithABunchOfIndexes } from '../../../../test/models/model-with-indexes.model'
import { DynamoRx } from '../../dynamo-rx'
import { attribute } from '../../expression/logical-operator/attribute.function'
import { QueryRequest } from './query.request'

export const DYNAMO_RX_MOCK: DynamoRx = <DynamoRx>{
  query(params: QueryInput): Observable<QueryOutput> {
    return of({})
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
      const request = new QueryRequest(<any>null, ModelWithABunchOfIndexes, getTableName(ModelWithABunchOfIndexes))

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
      const request = new QueryRequest(<any>null, ComplexModel, getTableName(ComplexModel))

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
      const request = new QueryRequest(<any>null, ComplexModel, getTableName(ComplexModel))

      request.where(attribute<ComplexModel>('active').eq(true), attribute('creationDate').lt(moment()))

      const params = request.params
      expect(params.FilterExpression).toBe('(#active = :active AND #creationDate < :creationDate)')
    })
  })

  describe('uses custom mapper for sortKey', () => {
    const request = new QueryRequest(
      <any>null,
      ModelWithCustomMapperForSortKeyModel,
      getTableName(ModelWithCustomMapperForSortKeyModel)
    )

    request.whereSortKey().between(new CustomId(moment('2018-01-01'), 0), new CustomId(moment('2018-12-31'), 99999))

    it('correct mapping', () => {
      expect(request.params.ExpressionAttributeValues).toBeDefined()
      expect(request.params.ExpressionAttributeValues).toEqual({
        ':customId': { N: '2018010100000' },
        ':customId_2': { N: '2018123199999' },
      })
    })
  })

  describe('calls endpoint with correct params', () => {
    const dynamoRx: DynamoRx = DYNAMO_RX_MOCK as DynamoRx
    let querySpy

    let request: QueryRequest<ComplexModel>

    beforeEach(() => {
      request = new QueryRequest(<any>null, ComplexModel, getTableName(ComplexModel))
      querySpy = spyOn(dynamoRx, 'query').and.callThrough()
    })
  })
})
