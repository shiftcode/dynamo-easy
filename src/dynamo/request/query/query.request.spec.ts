// tslint:disable:no-non-null-assertion

import { QueryOutput } from 'aws-sdk/clients/dynamodb'
import { of } from 'rxjs'
import { getTableName } from '../../../../test/helper'
import {
  ComplexModel,
  CustomId,
  INDEX_ACTIVE_CREATED_AT,
  ModelWithABunchOfIndexes,
  ModelWithCustomMapperForSortKeyModel,
  SimpleWithPartitionKeyModel,
} from '../../../../test/models'
import { updateDynamoEasyConfig } from '../../../config'
import { Attributes } from '../../../mapper'
import { attribute } from '../../expression'
import { QueryRequest } from './query.request'

describe('query request', () => {
  let querySpy: jasmine.Spy

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
      const request = new QueryRequest(<any>null, ComplexModel, getTableName(ComplexModel))

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
      const request = new QueryRequest(<any>null, ComplexModel, getTableName(ComplexModel))

      request.where(attribute<ComplexModel>('active').eq(true), attribute('creationDate').lt(new Date()))

      const params = request.params
      expect(params.FilterExpression).toBe('(#active = :active AND #creationDate < :creationDate)')
    })
  })

  describe('uses custom mapper for sortKey', () => {
    const request = new QueryRequest(
      <any>null,
      ModelWithCustomMapperForSortKeyModel,
      getTableName(ModelWithCustomMapperForSortKeyModel),
    )

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
    beforeEach(() => req = new QueryRequest(<any>null, SimpleWithPartitionKeyModel, 'tableName'))
    it('ascending', () => {
      req.ascending()
      expect(req.params.ScanIndexForward).toBeTruthy()
    })
    it('descending', () => {
      req.descending()
      expect(req.params.ScanIndexForward).toBeFalsy()
    })
  })

  describe('exec functions', () => {
    let queryRequest: QueryRequest<SimpleWithPartitionKeyModel>
    const jsItem: SimpleWithPartitionKeyModel = { id: 'myId', age: 15 }
    const dbItem: Attributes<SimpleWithPartitionKeyModel> = {
      id: { S: `${jsItem.id}` },
      age: { N: `${jsItem.age}` },
    }
    const queryOutput: QueryOutput = {
      Count: 2,
      Items: [dbItem, dbItem],
    }
    beforeEach(() => {
      querySpy = jasmine.createSpy().and.returnValue(of(queryOutput))
      queryRequest = new QueryRequest(<any>{ query: querySpy }, SimpleWithPartitionKeyModel, 'tableName')
      queryRequest.wherePartitionKey('myId')
    })

    it('execFullResponse', async () => {
      const res = await queryRequest.execFullResponse().toPromise()
      expect(res).toEqual({ ...queryOutput, Items: [jsItem, jsItem] })
    })

    it('execNoMap', async () => {
      const res = await queryRequest.execNoMap().toPromise()
      expect(res).toEqual(queryOutput)
    })

    it('exec', async () => {
      const res = await queryRequest.exec().toPromise()
      expect(res).toEqual([jsItem, jsItem])
    })

    it('execSingle', async () => {
      const res = await queryRequest.execSingle().toPromise()
      expect(querySpy).toHaveBeenCalled()
      expect(querySpy.calls.mostRecent().args[0]).toBeDefined()
      expect(querySpy.calls.mostRecent().args[0].Limit).toBe(1)
      expect(res).toEqual(jsItem)
    })

    it('execCount', async () => {
      const res = await queryRequest.execCount().toPromise()
      expect(querySpy).toHaveBeenCalled()
      expect(querySpy.calls.mostRecent().args[0]).toBeDefined()
      expect(querySpy.calls.mostRecent().args[0].Select).toBe('COUNT')
      expect(res).toBe(queryOutput.Count)
    })

    it('execFetchAll', async () => {
      const res = await queryRequest.execFetchAll().toPromise()
      expect(res).toEqual([jsItem, jsItem])
    })
  })

  describe('logger', () => {
    const sampleResponse: QueryOutput = { Items: [] }
    let logReceiver: jasmine.Spy
    let req: QueryRequest<SimpleWithPartitionKeyModel>

    beforeEach(() => {
      logReceiver = jasmine.createSpy()
      querySpy = jasmine.createSpy().and.returnValue(of(sampleResponse))
      updateDynamoEasyConfig({ logReceiver })
      req = new QueryRequest(<any>{ query: querySpy }, SimpleWithPartitionKeyModel, getTableName(SimpleWithPartitionKeyModel))
      req.wherePartitionKey('id')
    })

    it('exec should log params and response', async () => {
      await req.exec().toPromise()
      expect(logReceiver).toHaveBeenCalled()
      const logInfoData = logReceiver.calls.allArgs().map(i => i[0].data)
      expect(logInfoData.includes(req.params)).toBeTruthy()
      expect(logInfoData.includes(sampleResponse)).toBeTruthy()
    })

    it('execFullResponse should log params and response', async () => {
      await req.execFullResponse().toPromise()
      expect(logReceiver).toHaveBeenCalled()
      const logInfoData = logReceiver.calls.allArgs().map(i => i[0].data)
      expect(logInfoData.includes(req.params)).toBeTruthy()
      expect(logInfoData.includes(sampleResponse)).toBeTruthy()
    })

  })
})
