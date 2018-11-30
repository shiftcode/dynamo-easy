import { DeleteItemOutput } from 'aws-sdk/clients/dynamodb'
import { of } from 'rxjs'
import { getTableName } from '../../../../test/helper'
import { ComplexModel, SimpleWithPartitionKeyModel } from '../../../../test/models'
import { updateDynamoEasyConfig } from '../../../config'
import { DeleteRequest } from './delete.request'

describe('delete request', () => {
  it('should create request with key (composite) expression', () => {
    const now = new Date()
    const request = new DeleteRequest(<any>null, ComplexModel, getTableName(ComplexModel), 'partitionValue', now)
    const key = request.params.Key
    expect(key).toBeDefined()
    expect(Object.keys(key).length).toBe(2)

    expect(key.id).toBeDefined()
    expect(key.id).toEqual({ S: 'partitionValue' })
    expect(key.creationDate).toBeDefined()
    expect(key.creationDate).toEqual({
      S: now.toISOString(),
    })
  })

  it('should create request with key (simple) expression', () => {
    const request = new DeleteRequest(
      <any>null,
      SimpleWithPartitionKeyModel,
      getTableName(SimpleWithPartitionKeyModel),
      'myId',
    )
    const key = request.params.Key
    expect(key).toBeDefined()
    expect(Object.keys(key).length).toBe(1)

    expect(key.id).toBeDefined()
    expect(key.id).toEqual({ S: 'myId' })
  })

  it('should throw for no sort key value', () => {
    expect(
      () => new DeleteRequest(<any>null, ComplexModel, getTableName(ComplexModel), 'partitionValue'),
    ).toThrowError()
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
      req = new DeleteRequest(<any>{ deleteItem: deleteItemSpy }, SimpleWithPartitionKeyModel, getTableName(SimpleWithPartitionKeyModel), 'id')
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
