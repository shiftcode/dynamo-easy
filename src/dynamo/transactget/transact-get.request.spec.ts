// tslint:disable:no-non-null-assertion
// tslint:disable:no-unnecessary-class
import * as DynamoDB from '@aws-sdk/client-dynamodb'
import { ReturnConsumedCapacity } from '@aws-sdk/client-dynamodb'
import { SimpleWithCompositePartitionKeyModel, SimpleWithPartitionKeyModel } from '../../../test/models'
import { Attributes } from '../../mapper/type/attribute.type'
import { getTableName } from '../get-table-name.function'
import { TransactGetRequest } from './transact-get.request'
import { TransactGetRequest2 } from './transact-get.request.type'

describe('TransactGetRequest', () => {
  let req: TransactGetRequest

  describe('constructor', () => {
    beforeEach(() => (req = new TransactGetRequest(new DynamoDB.DynamoDB({}))))

    it('shoud init params', () => {
      expect(req.params).toBeDefined()
      expect(req.params.TransactItems).toBeDefined()
      expect(req.params.TransactItems.length).toBe(0)
    })
  })

  describe('returnConsumedCapacity', () => {
    beforeEach(() => (req = new TransactGetRequest(new DynamoDB.DynamoDB({}))))

    it('should set the param', () => {
      req.returnConsumedCapacity(ReturnConsumedCapacity.INDEXES)

      expect(req.params.ReturnConsumedCapacity).toBe('INDEXES')
    })
  })

  describe('forModel', () => {
    beforeEach(() => (req = new TransactGetRequest(new DynamoDB.DynamoDB({}))))

    it('should add a single item to params', () => {
      req.forModel(SimpleWithPartitionKeyModel, { id: 'myId' })

      expect(req.params.TransactItems.length).toBe(1)
      expect(req.params.TransactItems[0]).toEqual({
        Get: {
          TableName: getTableName(SimpleWithPartitionKeyModel),
          Key: { id: { S: 'myId' } },
        },
      })
    })

    it('should a multiple items to params', () => {
      req.forModel(SimpleWithPartitionKeyModel, { id: 'myId' })
      const creationDate = new Date()
      req.forModel(SimpleWithCompositePartitionKeyModel, { id: 'myId', creationDate })

      expect(req.params.TransactItems.length).toBe(2)
      expect(req.params.TransactItems[0]?.Get?.TableName).toBe(getTableName(SimpleWithPartitionKeyModel))

      expect(req.params.TransactItems[1]?.Get?.TableName).toBe(getTableName(SimpleWithCompositePartitionKeyModel))
      expect(req.params.TransactItems[1]?.Get?.Key).toEqual({
        id: { S: 'myId' },
        creationDate: { S: creationDate.toISOString() },
      })
    })

    it('should throw when non-model class is added', () => {
      class FooBar {}
      expect(() => req.forModel(FooBar, {})).toThrow()
    })

    it('should throw when more than 10 items are requested', () => {
      for (let i = 0; i < 10; i++) {
        req.forModel(SimpleWithPartitionKeyModel, { id: 'myId' })
      }
      // the 11th time
      expect(() => req.forModel(SimpleWithPartitionKeyModel, { id: 'myId' })).toThrow()
    })
  })

  describe('execNoMap, execFullResponse, exec', () => {
    let transactGetItemsMock: jest.Mock
    let req2: TransactGetRequest2<SimpleWithPartitionKeyModel, SimpleWithCompositePartitionKeyModel>
    let creationDate: Date

    beforeEach(() => {
      const dbItem: Attributes<SimpleWithPartitionKeyModel> = {
        id: { S: 'myId' },
        age: { N: '20' },
      }
      creationDate = new Date()
      const dbItem2: Attributes<SimpleWithCompositePartitionKeyModel> = {
        id: { S: 'myId' },
        creationDate: { S: creationDate.toISOString() },
        age: { N: '22' },
      }
      const output: DynamoDB.TransactGetItemsOutput = {
        ConsumedCapacity: [],
        Responses: [{ Item: dbItem }, { Item: dbItem2 }],
      }
      transactGetItemsMock = jest.fn().mockReturnValueOnce(Promise.resolve(output))
      req2 = new TransactGetRequest(new DynamoDB.DynamoDB({}))
        .forModel(SimpleWithPartitionKeyModel, { id: 'myId' })
        .forModel(SimpleWithCompositePartitionKeyModel, { id: 'myId', creationDate })
      Object.assign(req2, { dynamoDBWrapper: { transactGetItems: transactGetItemsMock } })
    })

    it('exec should return the mapped item', async () => {
      const result = await req2.exec()
      expect(Array.isArray(result)).toBeTruthy()
      expect(result.length).toBe(2)
      expect(result[0]).toEqual({
        id: 'myId',
        age: 20,
      })
      expect(result[1]).toEqual({
        id: 'myId',
        age: 22,
        creationDate,
      })
    })

    it('execFullResponse should return the mapped items', async () => {
      const result = await req2.execFullResponse()
      expect(result).toBeDefined()
      expect(result.ConsumedCapacity).toEqual([])
      expect(result.Items).toBeDefined()
      expect(result.Items[0]).toEqual({
        id: 'myId',
        age: 20,
      })
      expect(result.Items[1]).toEqual({
        id: 'myId',
        age: 22,
        creationDate,
      })
    })

    it('execNoMap should return the original response', async () => {
      const result = await req2.execNoMap()
      expect(result.ConsumedCapacity).toEqual([])
      expect(result.Responses).toBeDefined()
      expect(result.Responses![0]).toBeDefined()
      expect(result.Responses![0].Item).toBeDefined()
      expect(result.Responses![1]).toBeDefined()
      expect(result.Responses![1].Item).toBeDefined()
    })
  })
})
