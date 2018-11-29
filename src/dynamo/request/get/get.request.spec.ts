// tslint:disable:no-unused-expression
import { GetItemInput, GetItemOutput } from 'aws-sdk/clients/dynamodb'
import { of } from 'rxjs'
import { getTableName } from '../../../../test/helper'
import { SimpleWithCompositePartitionKeyModel, SimpleWithPartitionKeyModel } from '../../../../test/models'
import { updateDynamoEasyConfig } from '../../../config'
import { Attributes } from '../../../mapper'
import { GetRequest } from './get.request'

describe('GetRequest', () => {

  describe('constructor', () => {
    it('should throw when not providing correct args', () => {
      expect(() => {
        new GetRequest(<any>null, SimpleWithPartitionKeyModel, 'tableName', null)
      }).toThrow()

      expect(() => {
        new GetRequest(<any>null, SimpleWithCompositePartitionKeyModel, 'tableName', 'partitionKey')
      }).toThrow()
    })
  })

  describe('correct params', () => {
    let request: GetRequest<SimpleWithPartitionKeyModel>

    beforeEach(() => {
      request = new GetRequest(
        <any>null,
        SimpleWithPartitionKeyModel,
        getTableName(SimpleWithPartitionKeyModel),
        'partitionKeyValue',
      )
    })

    it('default params', () => {
      const params: GetItemInput = request.params
      expect(params.TableName).toBe('simple-with-partition-key-models')
      expect(params.Key).toEqual({ id: { S: 'partitionKeyValue' } })
      expect(Object.keys(params).length).toBe(2)
    })

    it('projection expression', () => {
      request.projectionExpression('name')

      const params = request.params
      expect(params.ProjectionExpression).toBe('#name')
      expect(params.ExpressionAttributeNames).toEqual({ '#name': 'name' })
      expect(Object.keys(params).length).toBe(4)
    })

    it('should set param for consistent read', () => {
      request.consistentRead(true)
      expect(request.params.ConsistentRead).toBe(true)
    })

    it('should set param for ReturnConsumedCapacity', () => {
      request.returnConsumedCapacity('TOTAL')
      expect(request.params.ReturnConsumedCapacity).toBe('TOTAL')
    })

  })

  describe('maps response item', () => {
    const jsItem: SimpleWithPartitionKeyModel = { age: 20, id: 'my-id' }
    const dbItem: Attributes<SimpleWithPartitionKeyModel> = { age: { N: '20' }, id: { S: 'my-id' } }
    const sampleResponse: GetItemOutput = { Item: dbItem }

    let getItemSpy: jasmine.Spy
    let req: GetRequest<SimpleWithPartitionKeyModel>

    beforeEach(() => {
      getItemSpy = jasmine.createSpy().and.returnValue(of(sampleResponse))
      req = new GetRequest(<any>{ getItem: getItemSpy }, SimpleWithPartitionKeyModel, getTableName(SimpleWithPartitionKeyModel), 'my-id')
    })
    it('exec', async () => {
      expect(await req.exec().toPromise()).toEqual(jsItem)
    })
    it('execFullResponse', async () => {
      expect(await req.execFullResponse().toPromise()).toEqual({ 'Item': jsItem })
    })
  })

  describe('logger', () => {
    let logReceiverSpy: jasmine.Spy
    let getItemSpy: jasmine.Spy
    const sampleResponse: GetItemOutput = { Item: undefined }
    let req: GetRequest<SimpleWithPartitionKeyModel>

    beforeEach(() => {
      logReceiverSpy = jasmine.createSpy()
      getItemSpy = jasmine.createSpy().and.returnValue(of(sampleResponse))
      updateDynamoEasyConfig({ logReceiver: logReceiverSpy })
      req = new GetRequest(<any>{ getItem: getItemSpy }, SimpleWithPartitionKeyModel, getTableName(SimpleWithPartitionKeyModel), 'partitionKeyValue')
    })

    it('exec should log params and response', async () => {
      await req.exec().toPromise()
      expect(logReceiverSpy).toHaveBeenCalled()
      const logInfoData = logReceiverSpy.calls.allArgs().map(i => i[0].data)
      expect(logInfoData.includes(req.params)).toBeTruthy()
      expect(logInfoData.includes(sampleResponse)).toBeTruthy()
    })

    it('execFullResponse should log params and response', async () => {
      await req.execFullResponse().toPromise()
      expect(logReceiverSpy).toHaveBeenCalled()
      const logInfoData = logReceiverSpy.calls.allArgs().map(i => i[0].data)
      expect(logInfoData.includes(req.params)).toBeTruthy()
      expect(logInfoData.includes(sampleResponse)).toBeTruthy()
    })

  })
})
