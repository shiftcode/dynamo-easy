import { DynamoDB } from 'aws-sdk'
import { of } from 'rxjs'
// tslint:disable:no-unnecessary-class
// tslint:disable:no-unused-expression
// tslint:disable:no-non-null-assertion
import { getTableName } from '../../../../test/helper'
import { SimpleWithCompositePartitionKeyModel, SimpleWithPartitionKeyModel } from '../../../../test/models'
import { updateDynamoEasyConfig } from '../../../config'
import { BatchGetSingleTableRequest } from './batch-get-single-table.request'

describe('batch get', () => {

  describe('constructor', () => {

    it('should throw when no class was given', () => {
      expect(() => new BatchGetSingleTableRequest(<any>null, <any>null, 'tableName', [])).toThrow()
    })

    it('should throw when a class without metadata was given', () => {
      class NoModelClass {}

      expect(() => new BatchGetSingleTableRequest(<any>null, NoModelClass, 'tableName', [])).toThrow()
    })

    it('should throw when adding a key without partition key', () => {
      expect(() => {
        new BatchGetSingleTableRequest(<any>null, SimpleWithPartitionKeyModel, 'tableName', [{}])
      }).toThrow()
      expect(() => {
        new BatchGetSingleTableRequest(<any>null, SimpleWithPartitionKeyModel, 'tableName', [<any>undefined])
      }).toThrow()
    })

    it('should throw when sort key is missing', () => {
      expect(() => {
        new BatchGetSingleTableRequest(<any>null, SimpleWithCompositePartitionKeyModel, 'tableName', [{ id: 'aKey' }])
      }).toThrow()
    })

  })

  describe('correct params', () => {

    it('simple primary key', () => {
      const request = new BatchGetSingleTableRequest<any>(<any>null, SimpleWithPartitionKeyModel, 'tableName', [
        { id: 'myId' },
        { id: 'myId2' },
      ])
      expect(request.params.RequestItems).toBeDefined()
      expect(request.params.RequestItems).toEqual({
        'tableName': { Keys: [{ id: { S: 'myId' } }, { id: { S: 'myId2' } }] },
      })
    })

    it('composite primary key', () => {
      const key: Partial<SimpleWithCompositePartitionKeyModel> = { id: 'myId', creationDate: new Date }
      const request = new BatchGetSingleTableRequest<any>(<any>null, SimpleWithCompositePartitionKeyModel, 'tableName', [key])

      expect(request.params.RequestItems).toBeDefined()
      expect(request.params.RequestItems).toEqual({
        'tableName': {
          Keys: [
            {
              id: { S: key.id },
              creationDate: { S: `${key.creationDate!.toISOString()}` },
            },
          ],
        },
      })
    })

    it('ConsistentRead', () => {
      const request = new BatchGetSingleTableRequest<any>(<any>null, SimpleWithPartitionKeyModel, 'tableName', [
        { id: 'myId' },
      ])
      request.consistentRead()
      expect(request.params.RequestItems).toBeDefined()
      expect(request.params.RequestItems.tableName).toBeDefined()
      expect(request.params.RequestItems.tableName.ConsistentRead).toBeTruthy()
    })

  })

  describe('should return appropriate value', () => {
    let batchGetItemsSpy: jasmine.Spy
    let req: BatchGetSingleTableRequest<SimpleWithPartitionKeyModel>

    const jsItem: SimpleWithPartitionKeyModel = { id: 'myId', age: 20 }
    const sampleResponse: DynamoDB.BatchGetItemOutput = {
      Responses: {
        'tableName': [{ id: { S: `${jsItem.id}` }, age: { N: `${jsItem.age}` } }],
      },
    }

    beforeEach(() => {
      batchGetItemsSpy = jasmine.createSpy().and.returnValue(of(sampleResponse))
      req = new BatchGetSingleTableRequest(<any>{ batchGetItems: batchGetItemsSpy }, SimpleWithPartitionKeyModel, 'tableName', [jsItem])
    })

    it('execNoMap', async () => {
      const result = await req.execNoMap().toPromise()
      expect(result).toBeDefined()
      expect(result).toEqual(sampleResponse)
    })
    it('execFullResponse', async () => {
      const result = await req.execFullResponse().toPromise()
      expect(result).toBeDefined()
      expect(result.Items).toBeDefined()
      expect(result.Items).toEqual([jsItem])
    })
    it('exec', async () => {
      const result = await req.exec().toPromise()
      expect(result).toEqual([jsItem])
    })
  })


  describe('logger', () => {
    let logReceiverSpy: jasmine.Spy
    let batchGetItemsSpy: jasmine.Spy
    let req: BatchGetSingleTableRequest<SimpleWithPartitionKeyModel>

    const sampleResponse = { Responses: null }

    beforeEach(() => {
      logReceiverSpy = jasmine.createSpy()
      batchGetItemsSpy = jasmine.createSpy().and.returnValue(of(sampleResponse))
      updateDynamoEasyConfig({ logReceiver: logReceiverSpy })
      req = new BatchGetSingleTableRequest(<any>{ batchGetItems: batchGetItemsSpy }, SimpleWithPartitionKeyModel, getTableName(SimpleWithPartitionKeyModel), [])
    })

    it('execNoMap should log params and response', async () => {
      await req.execNoMap().toPromise()
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

    it('exec should log params and response', async () => {
      await req.exec().toPromise()
      expect(logReceiverSpy).toHaveBeenCalled()
      const logInfoData = logReceiverSpy.calls.allArgs().map(i => i[0].data)
      expect(logInfoData.includes(req.params)).toBeTruthy()
      expect(logInfoData.includes(sampleResponse)).toBeTruthy()
    })

  })

})
