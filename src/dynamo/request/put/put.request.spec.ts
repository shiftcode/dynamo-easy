import { PutItemInput, PutItemOutput } from 'aws-sdk/clients/dynamodb'
import { of } from 'rxjs'
import { getTableName } from '../../../../test/helper'
import { SimpleWithCompositePartitionKeyModel, SimpleWithPartitionKeyModel } from '../../../../test/models'
import { updateDynamoEasyConfig } from '../../../config'
import { PutRequest } from './put.request'

describe('put request', () => {
  it('default params', () => {
    const item: SimpleWithPartitionKeyModel = { id: 'myId', age: 45 }
    const request = new PutRequest(
      <any>null,
      SimpleWithPartitionKeyModel,
      getTableName(SimpleWithPartitionKeyModel),
      item,
    )
    const params: PutItemInput = request.params

    expect(params.TableName).toBe('simple-with-partition-key-models')
    expect(params.Item).toEqual({ id: { S: 'myId' }, age: { N: '45' } })
    expect(Object.keys(params).length).toBe(2)
  })

  describe('if exists condition', () => {
    it('simple partition key', () => {
      const item: SimpleWithPartitionKeyModel = { id: 'myId', age: 45 }
      const request = new PutRequest(
        <any>null,
        SimpleWithPartitionKeyModel,
        getTableName(SimpleWithPartitionKeyModel),
        item,
      )
      request.ifNotExists()

      const params: PutItemInput = request.params
      expect(params.ConditionExpression).toBe('(attribute_not_exists (#id))')
      expect(params.ExpressionAttributeNames).toEqual({ '#id': 'id' })
      expect(params.ExpressionAttributeValues).toBeUndefined()
    })

    it('composite partition key', () => {
      const now = new Date()
      const item: SimpleWithCompositePartitionKeyModel = { id: 'myId', creationDate: now, age: 45 }
      const request = new PutRequest(
        <any>null,
        SimpleWithCompositePartitionKeyModel,
        getTableName(SimpleWithCompositePartitionKeyModel),
        item,
      )
      request.ifNotExists()

      const params: PutItemInput = request.params
      expect(params.ConditionExpression).toBe('(attribute_not_exists (#id) AND attribute_not_exists (#creationDate))')
      expect(params.ExpressionAttributeNames).toEqual({ '#id': 'id', '#creationDate': 'creationDate' })
      expect(params.ExpressionAttributeValues).toBeUndefined()
    })

    it('predicate', () => {
      const item: SimpleWithPartitionKeyModel = { id: 'myId', age: 45 }
      const request = new PutRequest(
        <any>null,
        SimpleWithPartitionKeyModel,
        getTableName(SimpleWithPartitionKeyModel),
        item,
      )
      request.ifNotExists(25 + 20 === 40)

      const params: PutItemInput = request.params
      expect(params.ConditionExpression).toBeUndefined()
      expect(params.ExpressionAttributeNames).toBeUndefined()
      expect(params.ExpressionAttributeValues).toBeUndefined()
    })
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
      req = new PutRequest(<any>{ putItem: putItemSpy }, SimpleWithPartitionKeyModel, getTableName(SimpleWithPartitionKeyModel), jsItem)
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
