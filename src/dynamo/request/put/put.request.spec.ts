import * as DynamoDB from 'aws-sdk/clients/dynamodb'
import { of } from 'rxjs'
import { SimpleWithPartitionKeyModel } from '../../../../test/models'
import { updateDynamoEasyConfig } from '../../../config'
import { PutRequest } from './put.request'

describe('put request', () => {
  describe('params', () => {
    const request = new PutRequest(<any>null, SimpleWithPartitionKeyModel, {
      id: 'myId',
      age: 45,
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
      expect(params.ConditionExpression).toBe('(attribute_not_exists (#id))')
      expect(params.ExpressionAttributeNames).toEqual({ '#id': 'id' })
      expect(params.ExpressionAttributeValues).toBeUndefined()
    })
  })

  describe('logger', () => {
    const sampleResponse: DynamoDB.PutItemOutput = { Attributes: undefined }
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
