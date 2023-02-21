import * as DynamoDB from '@aws-sdk/client-dynamodb'
import { SimpleWithPartitionKeyModel } from '../../../../test/models'
import { updateDynamoEasyConfig } from '../../../config/update-config.function'
import { DynamoDbWrapper } from '../../dynamo-db-wrapper'
import { PutRequest } from './put.request'

describe('put request', () => {
  describe('params', () => {
    let request: PutRequest<SimpleWithPartitionKeyModel>

    beforeEach(() => {
      request = new PutRequest(<any>null, SimpleWithPartitionKeyModel, {
        id: 'myId',
        age: 45,
      })
    })

    it('constructor', () => {
      const params: DynamoDB.PutItemInput = request.params

      expect(params.TableName).toBe('simple-with-partition-key-models')
      expect(params.Item).toEqual({ id: { S: 'myId' }, age: { N: '45' } })
      expect(Object.keys(params).length).toBe(2)
    })

    it('ifNotExists', () => {
      request.ifNotExists()

      const params: DynamoDB.PutItemInput = request.params
      expect(params.ConditionExpression).toBe('attribute_not_exists (#id)')
      expect(params.ExpressionAttributeNames).toEqual({ '#id': 'id' })
      expect(params.ExpressionAttributeValues).toBeUndefined()
    })

    it('ifNotExists with false  does add the predicate', () => {
      // but it also does not remove it. it actually does nothing with false but returning the request instance
      request.ifNotExists(false)

      const params: DynamoDB.PutItemInput = request.params
      expect(params.ConditionExpression).toBeUndefined()
      expect(params.ExpressionAttributeNames).toBeUndefined()
      expect(params.ExpressionAttributeValues).toBeUndefined()
    })

    it('returnValues', () => {
      const req = request.returnValues('ALL_OLD')
      expect(req.params.ReturnValues).toEqual('ALL_OLD')
    })
  })

  describe('logger', () => {
    const sampleResponse: DynamoDB.PutItemOutput = { Attributes: undefined }
    let logReceiverMock: jest.Mock
    let putItemMock: jest.Mock
    let req: PutRequest<SimpleWithPartitionKeyModel>

    const jsItem: SimpleWithPartitionKeyModel = {
      id: 'id',
      age: 0,
    }

    beforeEach(() => {
      logReceiverMock = jest.fn()
      putItemMock = jest.fn().mockReturnValueOnce(Promise.resolve(sampleResponse))
      updateDynamoEasyConfig({ logReceiver: logReceiverMock })
      req = new PutRequest(<any>{ putItem: putItemMock }, SimpleWithPartitionKeyModel, jsItem)
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

  describe('typings', () => {
    // tests basically only exists to be not valid when typings would be wrong
    let req: PutRequest<SimpleWithPartitionKeyModel>
    let dynamoDbWrapperMock: DynamoDbWrapper

    beforeEach(() => {
      dynamoDbWrapperMock = <any>{
        putItem: () =>
          Promise.resolve({
            Attributes: {
              id: { S: 'myId' },
              age: { N: '20' },
            },
          }),
      }
      req = new PutRequest(<any>dynamoDbWrapperMock, SimpleWithPartitionKeyModel, { id: 'myKey', age: 20 })
    })

    it('exec, ALL_OLD', async () => {
      const result: SimpleWithPartitionKeyModel = await req.returnValues('ALL_OLD').exec()
      expect(result).toEqual({ id: 'myId', age: 20 })
    })
  })
})
