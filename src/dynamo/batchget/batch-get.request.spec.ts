// tslint:disable:no-non-null-assertion
import * as DynamoDB from 'aws-sdk/clients/dynamodb'
import { of } from 'rxjs'
import { getTableName } from '../../../test/helper'
import { Organization, SimpleWithCompositePartitionKeyModel, SimpleWithPartitionKeyModel } from '../../../test/models'
import { Attributes, toDb } from '../../mapper'
import { DynamoRx } from '../dynamo-rx'
import { BatchGetRequest } from './batch-get.request'

describe('batch get', () => {
  let request: BatchGetRequest

  describe('params', () => {

    beforeEach(() => request = new BatchGetRequest())

    it('base params', () => {
      const params = request.params
      expect(params).toEqual({ RequestItems: {} })
    })

    it('key', () => {
      const o: Partial<Organization> = {
        id: 'idValue',
        createdAtDate: new Date(),
      }
      request.forModel(Organization, [o])
      const params = request.params
      expect(params.RequestItems).toBeDefined()
      expect(params.RequestItems.Organization).toBeDefined()
      expect(params.RequestItems.Organization.Keys).toBeDefined()
      expect(params.RequestItems.Organization.Keys).toEqual([{
        id: { S: 'idValue' },
        createdAtDate: { S: o.createdAtDate!.toISOString() },
      }])
    })
  })

  describe('forModel', () => {
    beforeEach(() => request = new BatchGetRequest())

    it('should throw when same table is used 2 times', () => {
      request.forModel(SimpleWithPartitionKeyModel, [{ id: 'idVal' }])
      expect(() => request.forModel(SimpleWithPartitionKeyModel, [{ id: 'otherVal' }])).toThrow()
    })

    it('should throw when sortKey is missing but necessary', () => {
      expect(() => request.forModel(SimpleWithCompositePartitionKeyModel, [{ id: 'idVal' }]))
    })

    it('should throw when modelClazz is not @Model decorated', () => {
      class X {id: string}

      expect(() => request.forModel(X, [{ id: 'ok' }])).toThrow()
    })

    it('should throw when providing null value ', () => {
      expect(() => request.forModel(SimpleWithPartitionKeyModel, [<any>null])).toThrow()
    })

    it('should allow ConsistentRead', () => {
      request.forModel(SimpleWithPartitionKeyModel, [{ id: 'myId' }], true)
      expect(request.params).toBeDefined()
      expect(request.params.RequestItems).toBeDefined()
      const keysOfTable = request.params.RequestItems[getTableName(SimpleWithPartitionKeyModel)]
      expect(keysOfTable).toBeDefined()
      expect(keysOfTable.ConsistentRead).toBeTruthy()
    })

    it('should throw when more than 100 items are added', () => {
      const items55: Array<Partial<SimpleWithPartitionKeyModel>> = new Array(55)
        .map((x, i) => ({ id: `id-${i}` }))
      const items60: Array<Partial<Organization>> = new Array(60)
        .map((x, i) => ({ id: `id-${i}`, createdAtDate: new Date() }))

      // at once
      expect(() => request.forModel(SimpleWithPartitionKeyModel, [...items55, ...items55])).toThrow()

      // in two steps
      expect(() => {
        request.forModel(SimpleWithPartitionKeyModel, items55)
        request.forModel(Organization, items60)
      }).toThrow()
    })

  })

  describe('execNoMap, execFullResponse, exec', () => {
    const jsItem1: SimpleWithPartitionKeyModel = { id: 'id-1', age: 21 }
    const jsItem2: SimpleWithPartitionKeyModel = { id: 'id-2', age: 22 }

    const output1: DynamoDB.BatchGetItemOutput = {
      Responses: {
        [getTableName(SimpleWithPartitionKeyModel)]: [toDb(jsItem1, SimpleWithPartitionKeyModel)],
      },
      UnprocessedKeys: {
        [getTableName(SimpleWithPartitionKeyModel)]: {
          Keys: [toDb(jsItem1, SimpleWithPartitionKeyModel)],
        },
      },
    }
    const output2: DynamoDB.BatchGetItemOutput = {
      Responses: {
        [getTableName(SimpleWithPartitionKeyModel)]: [toDb(jsItem2, SimpleWithPartitionKeyModel)],
      },
    }

    let batchGetItemsSpy: jasmine.Spy
    let nextSpyFn: () => { value: number }

    const generatorMock = () => <any>{ next: nextSpyFn }

    beforeEach(() => {
      request = new BatchGetRequest()
      request.forModel(SimpleWithPartitionKeyModel, [jsItem1, jsItem2])

      batchGetItemsSpy = jasmine.createSpy().and.returnValues(of(output1), of(output2))
      const dynamoRx: DynamoRx = <any>{ batchGetItems: batchGetItemsSpy }

      Object.assign(request, { dynamoRx })

      nextSpyFn = jest.fn().mockImplementation(() => ({ value: 0 }))
    })

    it('[execNoMap] should backoff and retry when UnprocessedItems are returned', async () => {
      const result = await request.execNoMap(generatorMock).toPromise()
      expect(nextSpyFn).toHaveBeenCalledTimes(1)
      expect(batchGetItemsSpy).toHaveBeenCalledTimes(2)
      expect(result).toBeDefined()
      expect(result.Responses).toBeDefined()

      const resultItems = result.Responses![getTableName(SimpleWithPartitionKeyModel)]
      expect(resultItems).toBeDefined()
      expect(resultItems.length).toBe(2)
      expect(resultItems[0]).toEqual(toDb(jsItem1, SimpleWithPartitionKeyModel))
      expect(resultItems[1]).toEqual(toDb(jsItem2, SimpleWithPartitionKeyModel))
    })

    it('[execFullResponse] should backoff and retry when UnprocessedItems are returned', async () => {
      const result = await request.execFullResponse(generatorMock).toPromise()
      expect(nextSpyFn).toHaveBeenCalledTimes(1)
      expect(batchGetItemsSpy).toHaveBeenCalledTimes(2)
      expect(result).toBeDefined()
      expect(result.Responses).toBeDefined()

      const resultItems = result.Responses![getTableName(SimpleWithPartitionKeyModel)]
      expect(resultItems).toBeDefined()
      expect(resultItems.length).toBe(2)
      expect(resultItems[0]).toEqual(jsItem1)
      expect(resultItems[1]).toEqual(jsItem2)
    })

    it('[exec] should backoff and retry when UnprocessedItems are returned', async () => {
      const result = await request.exec(generatorMock).toPromise()
      expect(nextSpyFn).toHaveBeenCalledTimes(1)
      expect(batchGetItemsSpy).toHaveBeenCalledTimes(2)
      expect(result).toBeDefined()

      const resultItems = result[getTableName(SimpleWithPartitionKeyModel)]
      expect(resultItems).toBeDefined()
      expect(resultItems.length).toBe(2)
      expect(resultItems[0]).toEqual(jsItem1)
      expect(resultItems[1]).toEqual(jsItem2)
    })

  })

  describe('should map the result items', () => {
    let batchGetItemsSpy: jasmine.Spy
    const jsItem: SimpleWithPartitionKeyModel = { id: 'idVal', age: 20 }
    const dbItem: Attributes<SimpleWithPartitionKeyModel> = {
      id: { S: 'idVal' },
      age: { N: '20' },
    }
    const sampleResponse: DynamoDB.BatchGetItemOutput = {
      Responses: {
        [getTableName(SimpleWithPartitionKeyModel)]: [dbItem],
      },
      UnprocessedKeys: {},
    }

    beforeEach(() => {
      batchGetItemsSpy = jasmine.createSpy().and.returnValue(of(sampleResponse))
      const dynamoRx: DynamoRx = <any>{ batchGetItems: batchGetItemsSpy }
      request = new BatchGetRequest()
      Object.assign(request, { dynamoRx })
      request.forModel(SimpleWithPartitionKeyModel, [{ id: 'idVal' }])
    })

    it('exec', async () => {
      const result = await request.exec().toPromise()
      expect(batchGetItemsSpy).toHaveBeenCalled()
      expect(result).toEqual({ [getTableName(SimpleWithPartitionKeyModel)]: [jsItem] })
    })

    it('execFullResponse', async () => {
      const result = await request.execFullResponse().toPromise()
      expect(batchGetItemsSpy).toHaveBeenCalled()
      expect(result).toEqual({
        Responses: { [getTableName(SimpleWithPartitionKeyModel)]: [jsItem] },
        UnprocessedKeys: {},
      })
    })

  })
})
