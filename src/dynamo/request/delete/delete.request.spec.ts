import * as DynamoDB from '@aws-sdk/client-dynamodb'
import { ComplexModel, SimpleWithPartitionKeyModel } from '../../../../test/models'
import { updateDynamoEasyConfig } from '../../../config/update-config.function'
import { DynamoDbWrapper } from '../../dynamo-db-wrapper'
import { DeleteRequest } from './delete.request'

describe('delete request', () => {
  describe('params', () => {
    it('simple key', () => {
      const request = new DeleteRequest(<any>null, SimpleWithPartitionKeyModel, 'myId')

      expect(request.params).toBeDefined()
      const key = request.params.Key
      expect(key).toBeDefined()
      expect(Object.keys(key ?? {}).length).toBe(1)
      expect(key?.id).toBeDefined()
      expect(key?.id).toEqual({ S: 'myId' })
    })

    it('composite key', () => {
      const now = new Date()
      const request = new DeleteRequest(<any>null, ComplexModel, 'myId', now)

      expect(request.params).toBeDefined()
      const key = request.params.Key
      expect(key).toBeDefined()
      expect(Object.keys(key ?? {}).length).toBe(2)

      expect(key?.id).toBeDefined()
      expect(key?.id).toEqual({ S: 'myId' })

      expect(key?.creationDate).toBeDefined()
      expect(key?.creationDate).toEqual({ S: now.toISOString() })
    })

    it('should throw for no sort key value', () => {
      expect(() => new DeleteRequest(<any>null, ComplexModel, 'myId')).toThrowError()
    })

    it('returnValues', () => {
      const request = new DeleteRequest(<any>null, SimpleWithPartitionKeyModel, 'myId')
      const req = request.returnValues('ALL_OLD')
      expect(req.params.ReturnValues).toEqual('ALL_OLD')
    })
  })

  describe('logger', () => {
    const sampleResponse: DynamoDB.DeleteItemOutput = { Attributes: undefined }
    let logReceiverMock: jest.Mock
    let deleteItemMock: jest.Mock
    let req: DeleteRequest<SimpleWithPartitionKeyModel>

    beforeEach(() => {
      logReceiverMock = jest.fn()
      deleteItemMock = jest.fn().mockReturnValueOnce(Promise.resolve(sampleResponse))
      updateDynamoEasyConfig({ logReceiver: logReceiverMock })
      req = new DeleteRequest(<any>{ deleteItem: deleteItemMock }, SimpleWithPartitionKeyModel, 'id')
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
    let req: DeleteRequest<SimpleWithPartitionKeyModel>
    let dynamoDbWrapperMock: DynamoDbWrapper

    beforeEach(() => {
      dynamoDbWrapperMock = <any>{
        deleteItem: () =>
          Promise.resolve({
            Attributes: {
              id: { S: 'myId' },
              age: { N: '20' },
            },
          }),
      }
      req = new DeleteRequest(<any>dynamoDbWrapperMock, SimpleWithPartitionKeyModel, 'myKey')
    })

    it('exec, ALL_OLD', async () => {
      const result: SimpleWithPartitionKeyModel = await req.returnValues('ALL_OLD').exec()
      expect(result).toEqual({ id: 'myId', age: 20 })
    })
  })
})
