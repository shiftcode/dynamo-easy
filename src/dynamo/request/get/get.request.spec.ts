// tslint:disable:no-unused-expression
import * as DynamoDB from '@aws-sdk/client-dynamodb'
import { ReturnConsumedCapacity } from '@aws-sdk/client-dynamodb'
import { SimpleWithCompositePartitionKeyModel, SimpleWithPartitionKeyModel } from '../../../../test/models'
import { updateDynamoEasyConfig } from '../../../config/update-config.function'
import { Attributes } from '../../../mapper/type/attribute.type'
import { getTableName } from '../../get-table-name.function'
import { GetRequest } from './get.request'

describe('GetRequest', () => {
  describe('constructor', () => {
    it('should throw when not providing correct args', () => {
      expect(() => {
        new GetRequest(<any>null, SimpleWithPartitionKeyModel, null)
      }).toThrow()

      expect(() => {
        new GetRequest(<any>null, SimpleWithCompositePartitionKeyModel, 'partitionKey')
      }).toThrow()
    })
  })

  describe('correct params (simple model)', () => {
    let request: GetRequest<SimpleWithPartitionKeyModel>

    beforeEach(() => {
      request = new GetRequest(<any>null, SimpleWithPartitionKeyModel, 'partitionKeyValue')
    })

    it('default params', () => {
      const params: DynamoDB.GetItemInput = request.params
      expect(params.TableName).toBe(getTableName(SimpleWithPartitionKeyModel))
      expect(params.Key).toEqual({ id: { S: 'partitionKeyValue' } })
      expect(Object.keys(params).length).toBe(2)
    })

    it('projection expression', () => {
      request.projectionExpression('age')
      const params = request.params
      expect(params.ProjectionExpression).toBe('#age')
      expect(params.ExpressionAttributeNames).toEqual({ '#age': 'age' })
      expect(Object.keys(params).length).toBe(4)
    })

    it('should set param for consistent read', () => {
      request.consistentRead(true)
      expect(request.params.ConsistentRead).toBe(true)
    })

    it('should set param for ReturnConsumedCapacity', () => {
      request.returnConsumedCapacity(ReturnConsumedCapacity.TOTAL)
      expect(request.params.ReturnConsumedCapacity).toBe('TOTAL')
    })
  })

  describe('maps response item', () => {
    const jsItem: SimpleWithPartitionKeyModel = { age: 20, id: 'my-id' }
    const dbItem: Attributes<SimpleWithPartitionKeyModel> = { age: { N: '20' }, id: { S: 'my-id' } }
    const sampleResponse: DynamoDB.GetItemOutput = { Item: dbItem }

    let getItemMock: jest.Mock
    let req: GetRequest<SimpleWithPartitionKeyModel>

    beforeEach(() => {
      getItemMock = jest.fn().mockReturnValueOnce(Promise.resolve(sampleResponse))
      req = new GetRequest(<any>{ getItem: getItemMock }, SimpleWithPartitionKeyModel, 'my-id')
    })

    it('exec', async () => {
      expect(await req.exec()).toEqual(jsItem)
    })

    it('execFullResponse', async () => {
      expect(await req.execFullResponse()).toEqual({ Item: jsItem })
    })
  })

  describe('logger', () => {
    const sampleResponse: DynamoDB.GetItemOutput = { Item: undefined }
    let logReceiverMock: jest.Mock
    let getItemMock: jest.Mock
    let req: GetRequest<SimpleWithPartitionKeyModel>

    beforeEach(() => {
      logReceiverMock = jest.fn()
      getItemMock = jest.fn().mockReturnValueOnce(Promise.resolve(sampleResponse))
      updateDynamoEasyConfig({ logReceiver: logReceiverMock })
      req = new GetRequest(<any>{ getItem: getItemMock }, SimpleWithPartitionKeyModel, 'partitionKeyValue')
    })

    it('exec should log params and response', async () => {
      await req.exec()
      expect(logReceiverMock).toHaveBeenCalled()
      const logInfoData = logReceiverMock.mock.calls.map((i) => i[0].data)
      expect(logInfoData.includes(req.params)).toBeTruthy()
      expect(logInfoData.includes(sampleResponse)).toBeTruthy()
    })

    it('execFullResponse should log params and response', async () => {
      await req.execFullResponse()
      expect(logReceiverMock).toHaveBeenCalled()
      const logInfoData = logReceiverMock.mock.calls.map((i) => i[0].data)
      expect(logInfoData.includes(req.params)).toBeTruthy()
      expect(logInfoData.includes(sampleResponse)).toBeTruthy()
    })
  })
})
