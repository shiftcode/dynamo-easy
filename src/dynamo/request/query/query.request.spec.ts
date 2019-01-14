// tslint:disable:no-non-null-assertion
// tslint:disable:max-classes-per-file

import {
  ComplexModel,
  CustomId,
  INDEX_ACTIVE_CREATED_AT,
  ModelWithABunchOfIndexes,
  ModelWithCustomMapperForSortKeyModel,
  ModelWithGSI,
  SimpleWithPartitionKeyModel,
} from '../../../../test/models'
import { INDEX_ACTIVE } from '../../../../test/models/model-with-indexes.model'
import { GSISortKey, Model, PartitionKey } from '../../../decorator/impl'
import { DynamoRx } from '../../dynamo-rx'
import { attribute } from '../../expression'
import { ReadManyRequest } from '../read-many.request'
import { QueryRequest } from './query.request'

describe('query request', () => {
  let querySpy: jasmine.Spy

  describe('constructor', () => {
    class MyQueryRequest extends QueryRequest<ComplexModel> {
      constructor(dynamoRx: DynamoRx) {
        super(dynamoRx, ComplexModel)
      }

      get theLogger() {
        return this.logger
      }
    }

    let request: MyQueryRequest

    beforeEach(() => {
      querySpy = jasmine.createSpy().and.returnValue(Promise.resolve({ Count: 1 }))
      request = new MyQueryRequest(<any>{ query: querySpy })
    })

    it('extends ReadManyRequest', () => {
      expect(request instanceof ReadManyRequest).toBeTruthy()
    })
    it('creates logger', () => {
      expect(request.theLogger).toBeDefined()
    })
    it('doRequest uses dynamoRx.query', async () => {
      await request.exec()
      expect(querySpy).toHaveBeenCalled()
    })
  })

  describe('defines correct params', () => {
    let request: QueryRequest<ComplexModel>

    beforeEach(() => {
      request = new QueryRequest(<any>null, ComplexModel)
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

  describe('wherePartitionKey', () => {
    let request: QueryRequest<any>

    @Model()
    class ModelWithoutGsiPartitionKey {
      @PartitionKey()
      id: string
      @GSISortKey('MY_GSI')
      count: number
    }

    beforeEach(() => {
      request = new QueryRequest(<any>null, ModelWithoutGsiPartitionKey)
    })

    it('throws when index has no partition key defined', () => {
      expect(() => request.index('MY_GSI').wherePartitionKey('myId')).toThrow()
    })
  })

  describe('whereSortKey', () => {
    let request: QueryRequest<any>
    beforeEach(() => {
      request = new QueryRequest(<any>null, ModelWithGSI)
    })
    it('throws when no sortKey was defined', () => {
      expect(() => request.whereSortKey()).toThrow()
    })
    it('throws when index has no sortKey', () => {
      expect(() => request.index(INDEX_ACTIVE).whereSortKey()).toThrow()
    })
  })

  describe('indexes', () => {
    it('simple', () => {
      const request = new QueryRequest(<any>null, ModelWithABunchOfIndexes)

      const now = new Date()

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
          S: now.toISOString(),
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
      expect(Object.keys(request.params.ExpressionAttributeNames!).length).toBe(1)
      expect(request.params.ExpressionAttributeNames!['#active']).toBe('isActive')

      expect(request.params.ExpressionAttributeValues).toBeDefined()
      expect(Object.keys(request.params.ExpressionAttributeValues!).length).toBe(1)
      expect(request.params.ExpressionAttributeValues![':active']).toEqual({ BOOL: true })
    })

    it('complex', () => {
      const request = new QueryRequest(<any>null, ComplexModel)

      request.where(attribute<ComplexModel>('active').eq(true), attribute('creationDate').lt(new Date()))

      const params = request.params
      expect(params.FilterExpression).toBe('(#active = :active AND #creationDate < :creationDate)')
    })
  })

  describe('uses custom mapper for sortKey', () => {
    const request = new QueryRequest(<any>null, ModelWithCustomMapperForSortKeyModel)

    request.whereSortKey().between(new CustomId(new Date('2018-01-01'), 0), new CustomId(new Date('2018-12-31'), 99999))

    it('correct mapping', () => {
      expect(request.params.ExpressionAttributeValues).toBeDefined()
      expect(request.params.ExpressionAttributeValues).toEqual({
        ':customId': { N: '2018010100000' },
        ':customId_2': { N: '2018123199999' },
      })
    })
  })

  describe('scan direction', () => {
    let req: QueryRequest<SimpleWithPartitionKeyModel>
    beforeEach(() => (req = new QueryRequest(<any>null, SimpleWithPartitionKeyModel)))
    it('ascending', () => {
      req.ascending()
      expect(req.params.ScanIndexForward).toBeTruthy()
    })
    it('descending', () => {
      req.descending()
      expect(req.params.ScanIndexForward).toBeFalsy()
    })
  })
})
