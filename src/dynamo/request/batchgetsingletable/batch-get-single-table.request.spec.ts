import { of } from 'rxjs'
// tslint:disable:no-unnecessary-class
// tslint:disable:no-unused-expression
import { getTableName } from '../../../../test/helper'
import { Organization, SimpleWithPartitionKeyModel } from '../../../../test/models'
import { updateDynamoEasyConfig } from '../../../config'
import { BatchGetSingleTableRequest } from './batch-get-single-table.request'

describe('batch get', () => {

  describe('constructor', () => {

    it('should throw when no class was given', () => {
      expect(() => new BatchGetSingleTableRequest(<any>null, <any>null, 'tableName', [])).toThrow()
    })

    it('should throw when adding a key without partition key', () => {
      expect(() => {
        new BatchGetSingleTableRequest(<any>null, SimpleWithPartitionKeyModel, 'tableName', [{}])
      }).toThrow()
      expect(() => {
        new BatchGetSingleTableRequest(<any>null, SimpleWithPartitionKeyModel, 'tableName', [undefined])
      }).toThrow()
    })

  })

  describe('correct params', () => {

    it('simple primary key', () => {
      const request = new BatchGetSingleTableRequest<any>(<any>null, Organization, getTableName(Organization), [
        'myId',
        'myId2',
      ])
      expect(request.params.RequestItems).toBeDefined()
      expect(request.params.RequestItems).toEqual({
        Organization: { Keys: [{ id: { S: 'myId' } }, { id: { S: 'myId2' } }] },
      })
    })

    it('composite primary key', () => {
      const keys = [{ partitionKey: 'myId', sortKey: 23 }]
      const request = new BatchGetSingleTableRequest<any>(<any>null, Organization, getTableName(Organization), keys)

      expect(request.params.RequestItems).toBeDefined()
      expect(request.params.RequestItems).toEqual({
        Organization: {
          Keys: [
            {
              id: { S: 'myId' },
              createdAtDate: { N: '23' },
            },
          ],
        },
      })
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
