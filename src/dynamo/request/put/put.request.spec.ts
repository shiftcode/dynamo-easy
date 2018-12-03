import { PutItemInput, PutItemOutput } from 'aws-sdk/clients/dynamodb'
import { of } from 'rxjs'
import { SimpleWithPartitionKeyModel } from '../../../../test/models'
import { updateDynamoEasyConfig } from '../../../config'
import { PutOperation } from '../../writeoperations/put.operation'
import { PutRequest } from './put.request'

describe('put request', () => {
  it('should create put operation', () => {
    const request = new PutRequest(<any>null, SimpleWithPartitionKeyModel, {
      id: 'myId',
      age: 45,
    })
    expect(request.operation).toBeDefined()
    expect(request.operation instanceof PutOperation).toBeTruthy()
    expect(request.operation.params).toBeDefined()
  })

  it('should propagate ifNotExists to the putOperation', () => {
    const item: SimpleWithPartitionKeyModel = { id: 'myId', age: 45 }
    const request = new PutRequest(<any>null, SimpleWithPartitionKeyModel, item)
    request.ifNotExists()

    const params: PutItemInput = request.params
    expect(params.ConditionExpression).toBe('(attribute_not_exists (#id))')
    expect(params.ExpressionAttributeNames).toEqual({ '#id': 'id' })
    expect(params.ExpressionAttributeValues).toBeUndefined()
    expect(request.operation.params).toBe(params)
  })

  describe('logger', () => {
    const sampleResponse: PutItemOutput = { Attributes: undefined }
    let logReceiver: jasmine.Spy
    let putItemSpy: jasmine.Spy
    let req: PutRequest<SimpleWithPartitionKeyModel>

    const jsItem: SimpleWithPartitionKeyModel = {
      id: 'id',
      age: 0,
    }

    beforeEach(() => {
      logReceiver = jasmine.createSpy()
      putItemSpy = jasmine.createSpy().and.returnValue(of(sampleResponse))
      updateDynamoEasyConfig({ logReceiver })
      req = new PutRequest(<any>{ putItem: putItemSpy }, SimpleWithPartitionKeyModel, jsItem)
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
