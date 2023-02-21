import * as DynamoDB from '@aws-sdk/client-dynamodb'
import { ReturnConsumedCapacity, ReturnItemCollectionMetrics } from '@aws-sdk/client-dynamodb'
import { ComplexModel, SimpleWithPartitionKeyModel } from '../../../test/models'
import { getTableName } from '../get-table-name.function'
import { BatchWriteRequest } from './batch-write.request'

describe('batchWriteRequest', () => {
  let req: BatchWriteRequest

  describe('constructor', () => {
    it('should initialize params', () => {
      req = new BatchWriteRequest(new DynamoDB.DynamoDB({}))
      expect(req.params.RequestItems).toBeDefined()
      expect(req.params.RequestItems).toEqual({})
    })

    describe('use provided DynamoDB instance', () => {
      const dynamoDB = new DynamoDB.DynamoDB({})
      const batchWriteRequest = new BatchWriteRequest(dynamoDB)
      expect(batchWriteRequest.dynamoDB).toBe(dynamoDB)

      const batchWriteRequest2 = new BatchWriteRequest(new DynamoDB.DynamoDB({}))
      expect(batchWriteRequest2.dynamoDB).not.toBe(dynamoDB)
    })
  })

  describe('returnConsumedCapacity', () => {
    it('should set params', () => {
      req = new BatchWriteRequest(new DynamoDB.DynamoDB({})).returnConsumedCapacity(ReturnConsumedCapacity.TOTAL)
      expect(req.params.ReturnConsumedCapacity).toBe('TOTAL')
    })
  })

  describe('returnItemCollectionMetrics', () => {
    it('should set params', () => {
      req = new BatchWriteRequest(new DynamoDB.DynamoDB({})).returnItemCollectionMetrics(
        ReturnItemCollectionMetrics.SIZE,
      )
      expect(req.params.ReturnItemCollectionMetrics).toBe('SIZE')
    })
  })

  describe('delete', () => {
    const now = new Date()

    it('should set params', () => {
      req = new BatchWriteRequest(new DynamoDB.DynamoDB({}))
        .delete(SimpleWithPartitionKeyModel, [{ id: 'myId1' }])
        .delete(ComplexModel, [{ id: 'myId2', creationDate: now }])

      expect(Object.keys(req.params.RequestItems)).toEqual([
        getTableName(SimpleWithPartitionKeyModel),
        getTableName(ComplexModel),
      ])

      const simpleReqItems = req.params.RequestItems[getTableName(SimpleWithPartitionKeyModel)]
      expect(simpleReqItems).toBeDefined()
      expect(simpleReqItems.length).toBe(1)
      expect(simpleReqItems[0].DeleteRequest).toEqual({
        Key: { id: { S: 'myId1' } },
      })

      const complexReqItems = req.params.RequestItems[getTableName(ComplexModel)]
      expect(complexReqItems).toBeDefined()
      expect(complexReqItems.length).toBe(1)
      expect(complexReqItems[0].DeleteRequest).toEqual({
        Key: { id: { S: 'myId2' }, creationDate: { S: now.toISOString() } },
      })
    })

    it('should throw when too many items', () => {
      const items: Array<Partial<SimpleWithPartitionKeyModel>> = [...new Array(30)].map((_, ix) => ({
        id: `mydId-${ix}`,
      }))
      expect(() =>
        new BatchWriteRequest(new DynamoDB.DynamoDB({})).delete(SimpleWithPartitionKeyModel, items),
      ).toThrow()
    })
  })

  describe('put', () => {
    const now = new Date()

    it('should set params', () => {
      req = new BatchWriteRequest(new DynamoDB.DynamoDB({}))
        .put(SimpleWithPartitionKeyModel, [<any>{ id: 'myId1' }])
        .put(ComplexModel, [<any>{ id: 'myId2', creationDate: now }])

      const simpleReqItems = req.params.RequestItems[getTableName(SimpleWithPartitionKeyModel)]
      expect(simpleReqItems).toBeDefined()
      expect(simpleReqItems.length).toBe(1)
      expect(simpleReqItems[0].PutRequest).toEqual({
        Item: { id: { S: 'myId1' } },
      })

      const complexReqItems = req.params.RequestItems[getTableName(ComplexModel)]
      expect(complexReqItems).toBeDefined()
      expect(complexReqItems.length).toBe(1)
      expect(complexReqItems[0].PutRequest).toEqual({
        Item: { id: { S: 'myId2' }, creationDate: { S: now.toISOString() } },
      })
    })

    it('should throw when too many items', () => {
      const items: SimpleWithPartitionKeyModel[] = [...new Array(30)].map((_, ix) => ({ id: `mydId-${ix}`, age: ix }))
      expect(() => new BatchWriteRequest(new DynamoDB.DynamoDB({})).put(SimpleWithPartitionKeyModel, items)).toThrow()
    })
  })

  describe('put and delete mixed', () => {
    const now = new Date()
    const tnSimple = getTableName(SimpleWithPartitionKeyModel)
    const tnComplex = getTableName(ComplexModel)

    const simpleItem: SimpleWithPartitionKeyModel = { id: 'myId', age: 25 }
    const simpleItems: SimpleWithPartitionKeyModel[] = [...new Array(16)].map((_, ix) => ({
      id: `mydId-${ix}`,
      age: ix,
    }))
    const complexItems: ComplexModel[] = [...new Array(16)].map(
      (_, ix) => <ComplexModel>{ id: `myId-${ix}`, creationDate: now },
    )

    beforeEach(() => (req = new BatchWriteRequest(new DynamoDB.DynamoDB({}))))

    it('should add correct request items', () => {
      req.put(ComplexModel, complexItems).delete(SimpleWithPartitionKeyModel, [simpleItem])
      expect(req.params.RequestItems[tnComplex].length).toBe(16)
      expect(req.params.RequestItems[tnComplex][5].PutRequest).toBeDefined()

      expect(req.params.RequestItems[tnSimple].length).toBe(1)
      expect(req.params.RequestItems[tnSimple][0].DeleteRequest).toBeDefined()
    })

    it('should throw when too many (1)', () => {
      expect(() => req.put(ComplexModel, complexItems).delete(SimpleWithPartitionKeyModel, simpleItems)).toThrow()
    })
    it('should throw when too many (2)', () => {
      expect(() => req.delete(ComplexModel, complexItems).put(SimpleWithPartitionKeyModel, simpleItems)).toThrow()
    })
  })

  describe('exec functions', () => {
    let batchWriteItemMock: jest.Mock

    beforeEach(() => {
      const output = {
        myResponse: true,
      }
      batchWriteItemMock = jest.fn().mockReturnValueOnce(Promise.resolve(output))
      const dynamoDBWrapper = <any>{ batchWriteItem: batchWriteItemMock }
      req = new BatchWriteRequest(new DynamoDB.DynamoDB({}))
      Object.assign(req, { dynamoDBWrapper })
    })

    it('exec should return void', async () => {
      expect(await req.exec()).toBeUndefined()
    })

    it('execFullResponse should return the full response', async () => {
      expect(await req.execFullResponse()).toEqual({ myResponse: true })
    })
  })
})
