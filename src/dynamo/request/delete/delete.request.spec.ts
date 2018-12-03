import { DeleteItemOutput } from 'aws-sdk/clients/dynamodb'
import { of } from 'rxjs'
import { getTableName } from '../../../../test/helper'
import { ComplexModel, SimpleWithPartitionKeyModel } from '../../../../test/models'
import { updateDynamoEasyConfig } from '../../../config'
import { DeleteOperation } from '../../writeoperations'
import { DeleteRequest } from './delete.request'

describe('delete request', () => {
  it('should create delete operation', () => {
    const now = new Date()
    const request = new DeleteRequest(<any>null, ComplexModel, getTableName(ComplexModel), 'partitionValue', now)
    expect(request.operation).toBeDefined()
    expect(request.operation instanceof DeleteOperation).toBeTruthy()
    expect(request.operation.params).toBeDefined()
  })

  describe('logger', () => {
    const sampleResponse: DeleteItemOutput = { Attributes: undefined }
    let logReceiver: jasmine.Spy
    let deleteItemSpy: jasmine.Spy
    let req: DeleteRequest<SimpleWithPartitionKeyModel>

    beforeEach(() => {
      logReceiver = jasmine.createSpy()
      deleteItemSpy = jasmine.createSpy().and.returnValue(of(sampleResponse))
      updateDynamoEasyConfig({ logReceiver })
      req = new DeleteRequest(
        <any>{ deleteItem: deleteItemSpy },
        SimpleWithPartitionKeyModel,
        getTableName(SimpleWithPartitionKeyModel),
        'id',
      )
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
