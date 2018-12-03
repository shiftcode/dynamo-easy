import { UpdateItemOutput } from 'aws-sdk/clients/dynamodb'
import { of } from 'rxjs'
import { SimpleWithCompositePartitionKeyModel, SimpleWithPartitionKeyModel, UpdateModel } from '../../../../test/models'
import { updateDynamoEasyConfig } from '../../../config'
import { update2 } from '../../expression'
import { update } from '../../expression/logical-operator/update.function'
import { getTableName } from '../../get-table-name.function'
import { UpdateRequest } from './update.request'

describe('update request', () => {
  it('should create updateOperations, with initial params', () => {
    const now = new Date()
    const request = new UpdateRequest(<any>null, SimpleWithCompositePartitionKeyModel, 'myId', now)

    expect(request.params).toBeDefined()
    expect(request.params.TableName).toBe(getTableName(SimpleWithCompositePartitionKeyModel))
    expect(request.params.Key).toEqual({
      id: { S: 'myId' },
      creationDate: { S: now.toISOString() },
    })
    expect(request.params).toBe(request.operation.params)
  })

  it('should delegate all operations to UpdateOperation.operations()', () => {
    const now = new Date()

    const request = new UpdateRequest(<any>null, UpdateModel, 'myId', now)
    request.operations(update<UpdateModel>('lastUpdated').set(now))

    expect(request.operation.params).toBe(request.params)

    expect(request.params.UpdateExpression).toBe('SET #lastUpdated = :lastUpdated')
    expect(request.params.ExpressionAttributeNames).toEqual({ '#lastUpdated': 'lastUpdated' })
    expect(request.params.ExpressionAttributeValues).toEqual({
      ':lastUpdated': {
        S: now.toISOString(),
      },
    })
  })

  describe('logger', () => {
    const sampleResponse: UpdateItemOutput = { Attributes: undefined }
    let logReceiver: jasmine.Spy
    let updateItemSpy: jasmine.Spy
    let req: UpdateRequest<SimpleWithPartitionKeyModel>

    beforeEach(() => {
      logReceiver = jasmine.createSpy()
      updateItemSpy = jasmine.createSpy().and.returnValue(of(sampleResponse))
      updateDynamoEasyConfig({ logReceiver })
      req = new UpdateRequest(<any>{ updateItem: updateItemSpy }, SimpleWithPartitionKeyModel, 'id')
      req.operations(update2(SimpleWithPartitionKeyModel, 'age').set(10))
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
