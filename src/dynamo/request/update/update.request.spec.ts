import * as DynamoDB from '@aws-sdk/client-dynamodb'
import {
  ComplexModel,
  Info,
  SimpleWithCompositePartitionKeyModel,
  SimpleWithPartitionKeyModel,
  UpdateModel,
} from '../../../../test/models'
import { Duration } from '../../../../test/models/duration.model'
import { SpecialCasesModel } from '../../../../test/models/special-cases-model.model'
import { updateDynamoEasyConfig } from '../../../config/update-config.function'
import { dateToStringMapper } from '../../../mapper/custom/date-to-string.mapper'
import { DynamoDbWrapper } from '../../dynamo-db-wrapper'
import { update, update2 } from '../../expression/logical-operator/update.function'
import { UpdateRequest } from './update.request'

describe('update request', () => {
  describe('params', () => {
    it('simple key', () => {
      const request = new UpdateRequest(<any>null, SimpleWithPartitionKeyModel, 'myId')

      expect(request.params).toBeDefined()
      const key = request.params.Key
      expect(key).toBeDefined()
      expect(Object.keys(key ?? {}).length).toBe(1)
      expect(key?.id).toBeDefined()
      expect(key?.id).toEqual({ S: 'myId' })
    })

    it('composite key', () => {
      const now = new Date()
      const request = new UpdateRequest(<any>null, ComplexModel, 'myId', now)

      expect(request.params).toBeDefined()
      const key = request.params.Key
      expect(key).toBeDefined()
      expect(Object.keys(key ?? {}).length).toBe(2)

      expect(key?.id).toBeDefined()
      expect(key?.id).toEqual({ S: 'myId' })

      expect(key?.creationDate).toBeDefined()
      expect(key?.creationDate).toEqual({ S: now.toISOString() })
    })

    it('should throw when no sortKey was given but necessary', () => {
      expect(() => new UpdateRequest(<any>null, SimpleWithCompositePartitionKeyModel, 'myId')).toThrow()
    })

    it('returnValues', () => {
      const request = new UpdateRequest(<any>null, SimpleWithPartitionKeyModel, 'myId')
      const req = request.returnValues('UPDATED_OLD')
      expect(req.params.ReturnValues).toEqual('UPDATED_OLD')
    })

    it('should add operation 1', () => {
      const now = new Date()
      const request = new UpdateRequest(<any>null, UpdateModel, 'myId')
      request.operations(update<UpdateModel>('lastUpdated').set(now))

      expect(request.params.UpdateExpression).toBe('SET #lastUpdated = :lastUpdated')
      expect(request.params.ExpressionAttributeNames).toEqual({ '#lastUpdated': 'lastUpdated' })
      expect(request.params.ExpressionAttributeValues).toEqual({
        ':lastUpdated': { S: now.toISOString() },
      })
    })
    it('should add operation 2', () => {
      const request = new UpdateRequest(<any>null, UpdateModel, 'myId')
      request.operations(update('numberValues[1]').incrementBy(42))

      expect(request.params.UpdateExpression).toBe('SET #numberValues[1] = #numberValues[1] + :numberValues_at_1')
      expect(request.params.ExpressionAttributeNames).toEqual({ '#numberValues': 'numberValues' })
      expect(request.params.ExpressionAttributeValues).toEqual({
        ':numberValues_at_1': { N: '42' },
      })
    })

    it('should allow to add multiple operations', () => {
      const request = new UpdateRequest(<any>null, UpdateModel, 'myId').operations(
        update2(UpdateModel, 'addresses').appendToList([{ place: 'PLACE', street: 'STREET', zip: 9999 }]),
        update2(UpdateModel, 'name').set('simon'),
        update2(UpdateModel, 'counter').add(20),
      )

      expect(request.params.UpdateExpression).toEqual(
        'SET #addresses = list_append(#addresses, :addresses), #name = :name ADD #counter :counter',
      )
      expect(request.params.ExpressionAttributeNames).toEqual({
        '#addresses': 'addresses',
        '#counter': 'counter',
        '#name': 'name',
      })
      expect(request.params.ExpressionAttributeValues).toEqual({
        ':addresses': {
          L: [
            {
              M: {
                place: { S: 'PLACE' },
                street: { S: 'STREET' },
                zip: { N: '9999' },
              },
            },
          ],
        },
        ':counter': { N: '20' },
        ':name': { S: 'simon' },
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

  describe('updateAttribute', () => {
    it('should add params and return the request', () => {
      const request = new UpdateRequest(<any>null, UpdateModel, 'myId').updateAttribute('counter').set(25, true)

      expect(request).toBeDefined()
      expect(request instanceof UpdateRequest).toBeTruthy()
      expect(request.params.UpdateExpression).toBe('SET #counter = if_not_exists(#counter, :counter)')
      expect(request.params.ExpressionAttributeNames).toEqual({ '#counter': 'counter' })
      expect(request.params.ExpressionAttributeValues).toEqual({ ':counter': { N: '25' } })
    })

    it('should map with metadata of itemType (Info)', () => {
      const now = new Date()
      const request = new UpdateRequest(<any>null, UpdateModel, 'myId').operations(
        update('informations[0]').set(<Info>{ details: 'my details', createdAt: now }),
      )

      expect(request).toBeDefined()
      expect(request.params.UpdateExpression).toBe('SET #informations[0] = :informations_at_0')
      expect(request.params.ExpressionAttributeNames).toEqual({ '#informations': 'informations' })
      expect(request.params.ExpressionAttributeValues).toEqual({
        ':informations_at_0': { M: { details: { S: 'my details' }, createdAt: dateToStringMapper.toDb(now) } },
      })
    })

    it('should map with property metadata of itemType (Info)', () => {
      const now = new Date()
      const request = new UpdateRequest(<any>null, UpdateModel, 'myId').operations(
        update('informations[0].createdAt').set(now),
      )

      expect(request).toBeDefined()
      expect(request.params.UpdateExpression).toBe('SET #informations[0].#createdAt = :informations_at_0__createdAt')
      expect(request.params.ExpressionAttributeNames).toEqual({
        '#informations': 'informations',
        '#createdAt': 'createdAt',
      })
      expect(request.params.ExpressionAttributeValues).toEqual({
        ':informations_at_0__createdAt': dateToStringMapper.toDb(now),
      })
    })

    it('should allow to add multiple update operations and conditions chained', () => {
      const request = new UpdateRequest(<any>null, UpdateModel, 'myId')
        .updateAttribute('name')
        .set('simon')
        .updateAttribute('addresses')
        .appendToList([{ place: 'PLACE', street: 'STREET', zip: 9999 }])
        .updateAttribute('topics')
        .add(['myNewTopic'])
        .updateAttribute('counter')
        .remove()
        .onlyIfAttribute('topics')
        .contains('myOldTopic')

      expect(request).toBeDefined()
      expect(request instanceof UpdateRequest).toBeTruthy()
      expect(request.params.UpdateExpression).toBe(
        'SET #name = :name, #addresses = list_append(#addresses, :addresses) ADD #topics :topics REMOVE #counter',
      )
      expect(request.params.ExpressionAttributeNames).toEqual({
        '#name': 'name',
        '#addresses': 'addresses',
        '#topics': 'topics',
        '#counter': 'counter',
      })
      expect(request.params.ExpressionAttributeValues).toEqual({
        ':name': { S: 'simon' },
        ':addresses': { L: [{ M: { place: { S: 'PLACE' }, street: { S: 'STREET' }, zip: { N: '9999' } } }] },
        ':topics': { SS: ['myNewTopic'] },
        ':topics_2': { S: 'myOldTopic' },
      })
    })
  })

  describe('logger', () => {
    const sampleResponse: DynamoDB.UpdateItemOutput = { Attributes: undefined }
    let logReceiverMock: jest.Mock
    let updateItemMock: jest.Mock
    let req: UpdateRequest<SimpleWithPartitionKeyModel>

    beforeEach(() => {
      logReceiverMock = jest.fn()
      updateItemMock = jest.fn().mockReturnValueOnce(Promise.resolve(sampleResponse))
      updateDynamoEasyConfig({ logReceiver: logReceiverMock })
      req = new UpdateRequest(<any>{ updateItem: updateItemMock }, SimpleWithPartitionKeyModel, 'id')
      req.operations(update2(SimpleWithPartitionKeyModel, 'age').set(10))
    })

    it('exec should log params and response', async () => {
      await req.exec()
      expect(logReceiverMock).toHaveBeenCalled()
      const logInfoData = logReceiverMock.mock.calls.map((i: any) => i[0].data)
      expect(logInfoData.includes(req.params)).toBeTruthy()
      expect(logInfoData.includes(sampleResponse)).toBeTruthy()
    })

    it('execFullResponse should log params and response', async () => {
      await req.execFullResponse()
      expect(logReceiverMock).toHaveBeenCalled()
      const logInfoData = logReceiverMock.mock.calls.map((i: any) => i[0].data)
      expect(logInfoData.includes(req.params)).toBeTruthy()
      expect(logInfoData.includes(sampleResponse)).toBeTruthy()
    })
  })

  describe('typings', () => {
    // tests basically only exists to be not valid when typings would be wrong
    let req: UpdateRequest<SimpleWithPartitionKeyModel>
    let dynamoDbWrapperMock: DynamoDbWrapper

    beforeEach(() => {
      dynamoDbWrapperMock = <any>{
        updateItem: () =>
          Promise.resolve({
            Attributes: {
              id: { S: 'myId' },
              age: { N: '20' },
            },
          }),
      }
      req = new UpdateRequest(<any>dynamoDbWrapperMock, SimpleWithPartitionKeyModel, 'myKey')
    })

    it('exec, ALL_OLD', async () => {
      const result: SimpleWithPartitionKeyModel = await req.returnValues('ALL_OLD').exec()
      expect(result).toEqual({ id: 'myId', age: 20 })
    })

    it('exec, UPDATED_OLD', async () => {
      const result: Partial<SimpleWithPartitionKeyModel> = await req.returnValues('UPDATED_OLD').exec()
      expect(result).toEqual({ id: 'myId', age: 20 })
    })
  })
})
