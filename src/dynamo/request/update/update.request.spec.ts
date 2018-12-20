import { UpdateItemOutput } from 'aws-sdk/clients/dynamodb'
import { of } from 'rxjs'
import {
  ComplexModel,
  SimpleWithCompositePartitionKeyModel,
  SimpleWithPartitionKeyModel,
  UpdateModel,
} from '../../../../test/models'
import { Duration } from '../../../../test/models/duration.model'
import { SpecialCasesModel } from '../../../../test/models/special-cases-model.model'
import { updateDynamoEasyConfig } from '../../../config'
import { update2 } from '../../expression'
import { update } from '../../expression/logical-operator/update.function'
import { UpdateRequest } from './update.request'

describe('update request', () => {
  describe('params', () => {
    it('simple key', () => {
      const request = new UpdateRequest(<any>null, SimpleWithPartitionKeyModel, 'myId')

      expect(request.params).toBeDefined()
      const key = request.params.Key
      expect(key).toBeDefined()
      expect(Object.keys(key).length).toBe(1)
      expect(key.id).toBeDefined()
      expect(key.id).toEqual({ S: 'myId' })
    })

    it('composite key', () => {
      const now = new Date()
      const request = new UpdateRequest(<any>null, ComplexModel, 'myId', now)

      expect(request.params).toBeDefined()
      const key = request.params.Key
      expect(key).toBeDefined()
      expect(Object.keys(key).length).toBe(2)

      expect(key.id).toBeDefined()
      expect(key.id).toEqual({ S: 'myId' })

      expect(key.creationDate).toBeDefined()
      expect(key.creationDate).toEqual({ S: now.toISOString() })
    })

    it('should throw when no sortKey was given but necessary', () => {
      expect(() => new UpdateRequest(<any>null, SimpleWithCompositePartitionKeyModel, 'myId')).toThrow()
    })

    it('should add operations', () => {
      const now = new Date()

      const request = new UpdateRequest(<any>null, UpdateModel, 'myId', now)
      request.operations(update<UpdateModel>('lastUpdated').set(now))

      expect(request.params.UpdateExpression).toBe('SET #lastUpdated = :lastUpdated')
      expect(request.params.ExpressionAttributeNames).toEqual({ '#lastUpdated': 'lastUpdated' })
      expect(request.params.ExpressionAttributeValues).toEqual({
        ':lastUpdated': { S: now.toISOString() },
      })
    })

    it('should allow ops with custom mappers (1)', () => {
      const request = new UpdateRequest(<any>null, SpecialCasesModel, 'myId')
      request.operations(update2(SpecialCasesModel, 'myChars').removeFromSet('abc'))
      expect(request.params).toBeDefined()
      expect(request.params.ExpressionAttributeValues).toEqual({ ':myChars': { SS: ['a', 'b', 'c'] } })
      expect(request.params.ExpressionAttributeNames).toEqual({ '#myChars': 'myChars' })
      expect(request.params.UpdateExpression).toEqual('DELETE #myChars :myChars')
    })

    it('should allow ops with custom mappers (2)', () => {
      const request = new UpdateRequest(<any>null, SpecialCasesModel, 'myId')
      request.operations(update2(SpecialCasesModel, 'duration').add(new Duration(30)))
      expect(request.params).toBeDefined()
      expect(request.params.ExpressionAttributeValues).toEqual({ ':duration': { N: '30' } })
      expect(request.params.ExpressionAttributeNames).toEqual({ '#duration': 'duration' })
      expect(request.params.UpdateExpression).toEqual('ADD #duration :duration')
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
