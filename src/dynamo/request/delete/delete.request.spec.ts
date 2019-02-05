import * as DynamoDB from 'aws-sdk/clients/dynamodb'
import { ComplexModel, SimpleWithPartitionKeyModel } from '../../../../test/models'
import { updateDynamoEasyConfig } from '../../../config/update-config.function'
import { DeleteRequest } from './delete.request'

describe('delete request', () => {
  describe('params', () => {
    it('simple key', () => {
      const request = new DeleteRequest(<any>null, SimpleWithPartitionKeyModel, 'myId')

      expect(request.params).toBeDefined()
      const key = request.params.Key
      expect(key).toBeDefined()
      expect(Object.keys(key).length).toBe(1)
      expect(key.id).toBeDefined()
      expect(key.id).toEqual({ S: 'myId' })
    })

    it('composite key', () => {
      const now = new Date()
      const request = new DeleteRequest(<any>null, ComplexModel, 'myId', now)

      expect(request.params).toBeDefined()
      const key = request.params.Key
      expect(key).toBeDefined()
      expect(Object.keys(key).length).toBe(2)

      expect(key.id).toBeDefined()
      expect(key.id).toEqual({ S: 'myId' })

      expect(key.creationDate).toBeDefined()
      expect(key.creationDate).toEqual({ S: now.toISOString() })
    })

    it('should throw for no sort key value', () => {
      expect(() => new DeleteRequest(<any>null, ComplexModel, 'myId')).toThrowError()
    })
  })

  describe('logger', () => {
    const sampleResponse: DynamoDB.DeleteItemOutput = { Attributes: undefined }
    let logReceiver: jasmine.Spy
    let deleteItemSpy: jasmine.Spy
    let req: DeleteRequest<SimpleWithPartitionKeyModel>

    beforeEach(() => {
      logReceiver = jasmine.createSpy()
      deleteItemSpy = jasmine.createSpy().and.returnValue(Promise.resolve(sampleResponse))
      updateDynamoEasyConfig({ logReceiver })
      req = new DeleteRequest(<any>{ deleteItem: deleteItemSpy }, SimpleWithPartitionKeyModel, 'id')
    })

    it('exec should log params and response', async () => {
      await req.exec()
      expect(logReceiver).toHaveBeenCalled()
      const logInfoData = logReceiver.calls.allArgs().map(i => i[0].data)
      expect(logInfoData.includes(req.params)).toBeTruthy()
      expect(logInfoData.includes(sampleResponse)).toBeTruthy()
    })

    it('execFullResponse should log params and response', async () => {
      await req.execFullResponse()
      expect(logReceiver).toHaveBeenCalled()
      const logInfoData = logReceiver.calls.allArgs().map(i => i[0].data)
      expect(logInfoData.includes(req.params)).toBeTruthy()
      expect(logInfoData.includes(sampleResponse)).toBeTruthy()
    })
  })
})
