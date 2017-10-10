import * as moment from 'moment'
import { getTableName } from '../../../../test/helper/get-table-name.function'
import { Address, UpdateModel } from '../../../../test/models/update.model'
import { update } from '../../expression/logical-operator/update.function'
import { UpdateRequest } from './update.request'

describe('update request', () => {
  describe('update expression', () => {
    describe('single operation', () => {
      it('incrementBy', () => {
        const now = moment()

        const request = new UpdateRequest(<any>null, UpdateModel, getTableName(UpdateModel), 'myId', now)
        request.operations(update<UpdateModel>('counter').incrementBy(5))

        expect(request.params.UpdateExpression).toBe('SET #counter = #counter + :counter')
        expect(request.params.ExpressionAttributeNames).toEqual({ '#counter': 'counter' })
        expect(request.params.ExpressionAttributeValues).toEqual({ ':counter': { N: '5' } })
      })

      it('decrementBy', () => {
        const now = moment()

        const request = new UpdateRequest(<any>null, UpdateModel, getTableName(UpdateModel), 'myId', now)
        request.operations(update<UpdateModel>('counter').decrementBy(5))

        expect(request.params.UpdateExpression).toBe('SET #counter = #counter - :counter')
        expect(request.params.ExpressionAttributeNames).toEqual({ '#counter': 'counter' })
        expect(request.params.ExpressionAttributeValues).toEqual({ ':counter': { N: '5' } })
      })

      it('set', () => {
        const now = moment()

        const request = new UpdateRequest(<any>null, UpdateModel, getTableName(UpdateModel), 'myId', now)

        request.operations(update<UpdateModel>('lastUpdated').set(now))

        expect(request.params.UpdateExpression).toBe('SET #lastUpdated = :lastUpdated')
        expect(request.params.ExpressionAttributeNames).toEqual({ '#lastUpdated': 'lastUpdated' })
        expect(request.params.ExpressionAttributeValues).toEqual({
          ':lastUpdated': {
            S: now
              .clone()
              .utc()
              .format(),
          },
        })
      })

      it('set (nested map)', () => {
        const now = moment()

        const request = new UpdateRequest(<any>null, UpdateModel, getTableName(UpdateModel), 'myId', now)

        request.operations(update('info.details').set('the new detail'))

        expect(request.params.UpdateExpression).toBe('SET #info.#details = :info__details')
        expect(request.params.ExpressionAttributeNames).toEqual({ '#info': 'info', '#details': 'details' })
        expect(request.params.ExpressionAttributeValues).toEqual({
          ':info__details': {
            S: 'the new detail',
          },
        })
      })

      it('set (list)', () => {
        const now = moment()
        const request = new UpdateRequest(<any>null, UpdateModel, getTableName(UpdateModel), 'myId', now)

        request.operations(update('addresses[1]').set({ street: 'Bond Street', place: 'London', zip: 25650 }))

        expect(request.params.UpdateExpression).toBe('SET #addresses[1] = :addresses_at_1')
        expect(request.params.ExpressionAttributeNames).toEqual({ '#addresses': 'addresses' })
        expect(request.params.ExpressionAttributeValues).toEqual({
          ':addresses_at_1': {
            M: {
              street: {
                S: 'Bond Street',
              },
              place: {
                S: 'London',
              },
              zip: {
                N: '25650',
              },
            },
          },
        })
      })

      it('append to list (default position)', () => {
        const now = moment()
        const request = new UpdateRequest(<any>null, UpdateModel, getTableName(UpdateModel), 'myId', now)

        const newAddress: Address = { street: 'The street', place: 'London', zip: 15241 }
        request.operations(update<UpdateModel>('addresses').appendToList(newAddress))

        expect(request.params.UpdateExpression).toBe('SET #addresses = list_append(#addresses, :addresses)')
        expect(request.params.ExpressionAttributeNames).toEqual({ '#addresses': 'addresses' })
        expect(request.params.ExpressionAttributeValues).toEqual({
          ':addresses': {
            M: {
              street: {
                S: 'The street',
              },
              place: {
                S: 'London',
              },
              zip: {
                N: '15241',
              },
            },
          },
        })
      })

      it('append to list (position = END)', () => {
        const now = moment()
        const request = new UpdateRequest(<any>null, UpdateModel, getTableName(UpdateModel), 'myId', now)

        const newAddress: Address = { street: 'The street', place: 'London', zip: 15241 }
        request.operations(update<UpdateModel>('addresses').appendToList(newAddress, 'END'))

        expect(request.params.UpdateExpression).toBe('SET #addresses = list_append(#addresses, :addresses)')
        expect(request.params.ExpressionAttributeNames).toEqual({ '#addresses': 'addresses' })
        expect(request.params.ExpressionAttributeValues).toEqual({
          ':addresses': {
            M: {
              street: {
                S: 'The street',
              },
              place: {
                S: 'London',
              },
              zip: {
                N: '15241',
              },
            },
          },
        })
      })

      it('append to list (position = START)', () => {
        const now = moment()
        const request = new UpdateRequest(<any>null, UpdateModel, getTableName(UpdateModel), 'myId', now)

        const newAddress: Address = { street: 'The street', place: 'London', zip: 15241 }
        request.operations(update<UpdateModel>('addresses').appendToList(newAddress, 'START'))

        expect(request.params.UpdateExpression).toBe('SET #addresses = list_append(:addresses, #addresses)')
        expect(request.params.ExpressionAttributeNames).toEqual({ '#addresses': 'addresses' })
        expect(request.params.ExpressionAttributeValues).toEqual({
          ':addresses': {
            M: {
              street: {
                S: 'The street',
              },
              place: {
                S: 'London',
              },
              zip: {
                N: '15241',
              },
            },
          },
        })
      })

      it('remove', () => {
        const now = moment()
        const request = new UpdateRequest(<any>null, UpdateModel, getTableName(UpdateModel), 'myId', now)

        request.operations(update<UpdateModel>('counter').remove(), update<UpdateModel>('name').remove())

        expect(request.params.UpdateExpression).toBe('REMOVE #counter, #name')
        expect(request.params.ExpressionAttributeNames).toEqual({ '#counter': 'counter', '#name': 'name' })
        expect(request.params.ExpressionAttributeValues).toBeUndefined()
      })

      it('remove from list at (single)', () => {
        const now = moment()
        const request = new UpdateRequest(<any>null, UpdateModel, getTableName(UpdateModel), 'myId', now)

        request.operations(update<UpdateModel>('addresses').removeFromListAt(2))

        expect(request.params.UpdateExpression).toBe('REMOVE #addresses[2]')
        expect(request.params.ExpressionAttributeNames).toEqual({ '#addresses': 'addresses' })
        expect(request.params.ExpressionAttributeValues).toBeUndefined()
      })

      it('remove from list at (many)', () => {
        const now = moment()
        const request = new UpdateRequest(<any>null, UpdateModel, getTableName(UpdateModel), 'myId', now)

        request.operations(update<UpdateModel>('addresses').removeFromListAt(2, 5, 6))

        expect(request.params.UpdateExpression).toBe('REMOVE #addresses[2], #addresses[5], #addresses[6]')
        expect(request.params.ExpressionAttributeNames).toEqual({ '#addresses': 'addresses' })
        expect(request.params.ExpressionAttributeValues).toBeUndefined()
      })

      it('add (multiple arr)', () => {
        const now = moment()
        const request = new UpdateRequest(<any>null, UpdateModel, getTableName(UpdateModel), 'myId', now)

        request.operations(update<UpdateModel>('topics').add(['newTopic', 'newTopic2']))

        expect(request.params.UpdateExpression).toBe('ADD #topics :topics')
        expect(request.params.ExpressionAttributeNames).toEqual({ '#topics': 'topics' })
        expect(request.params.ExpressionAttributeValues).toEqual({
          ':topics': {
            SS: ['newTopic', 'newTopic2'],
          },
        })
      })

      it('add (multiple set)', () => {
        const now = moment()
        const request = new UpdateRequest(<any>null, UpdateModel, getTableName(UpdateModel), 'myId', now)

        request.operations(update<UpdateModel>('topics').add(new Set(['newTopic', 'newTopic2'])))

        expect(request.params.UpdateExpression).toBe('ADD #topics :topics')
        expect(request.params.ExpressionAttributeNames).toEqual({ '#topics': 'topics' })
        expect(request.params.ExpressionAttributeValues).toEqual({
          ':topics': {
            SS: ['newTopic', 'newTopic2'],
          },
        })
      })

      it('add (multiple vararg)', () => {
        const now = moment()
        const request = new UpdateRequest(<any>null, UpdateModel, getTableName(UpdateModel), 'myId', now)

        request.operations(update<UpdateModel>('topics').add('newTopic', 'newTopic2'))

        expect(request.params.UpdateExpression).toBe('ADD #topics :topics')
        expect(request.params.ExpressionAttributeNames).toEqual({ '#topics': 'topics' })
        expect(request.params.ExpressionAttributeValues).toEqual({
          ':topics': {
            SS: ['newTopic', 'newTopic2'],
          },
        })
      })

      it('add (single)', () => {
        const now = moment()
        const request = new UpdateRequest(<any>null, UpdateModel, getTableName(UpdateModel), 'myId', now)

        request.operations(update<UpdateModel>('topics').add('newTopic'))

        expect(request.params.UpdateExpression).toBe('ADD #topics :topics')
        expect(request.params.ExpressionAttributeNames).toEqual({ '#topics': 'topics' })
        expect(request.params.ExpressionAttributeValues).toEqual({
          ':topics': {
            SS: ['newTopic'],
          },
        })
      })

      it('remove from set (single)', () => {
        const now = moment()
        const request = new UpdateRequest(<any>null, UpdateModel, getTableName(UpdateModel), 'myId', now)

        request.operations(update<UpdateModel>('topics').removeFromSet('newTopic'))

        expect(request.params.UpdateExpression).toBe('DELETE #topics :topics')
        expect(request.params.ExpressionAttributeNames).toEqual({ '#topics': 'topics' })
        expect(request.params.ExpressionAttributeValues).toEqual({
          ':topics': {
            SS: ['newTopic'],
          },
        })
      })

      it('remove from set (multiple vararg)', () => {
        const now = moment()
        const request = new UpdateRequest(<any>null, UpdateModel, getTableName(UpdateModel), 'myId', now)

        request.operations(update<UpdateModel>('topics').removeFromSet('newTopic', 'newTopic2'))

        expect(request.params.UpdateExpression).toBe('DELETE #topics :topics')
        expect(request.params.ExpressionAttributeNames).toEqual({ '#topics': 'topics' })
        expect(request.params.ExpressionAttributeValues).toEqual({
          ':topics': {
            SS: ['newTopic', 'newTopic2'],
          },
        })
      })

      it('remove from set (multiple arr)', () => {
        const now = moment()
        const request = new UpdateRequest(<any>null, UpdateModel, getTableName(UpdateModel), 'myId', now)

        request.operations(update<UpdateModel>('topics').removeFromSet(['newTopic', 'newTopic2']))

        expect(request.params.UpdateExpression).toBe('DELETE #topics :topics')
        expect(request.params.ExpressionAttributeNames).toEqual({ '#topics': 'topics' })
        expect(request.params.ExpressionAttributeValues).toEqual({
          ':topics': {
            SS: ['newTopic', 'newTopic2'],
          },
        })
      })

      it('remove from set (multiple set)', () => {
        const now = moment()
        const request = new UpdateRequest(<any>null, UpdateModel, getTableName(UpdateModel), 'myId', now)

        request.operations(update<UpdateModel>('topics').removeFromSet(new Set(['newTopic', 'newTopic2'])))

        expect(request.params.UpdateExpression).toBe('DELETE #topics :topics')
        expect(request.params.ExpressionAttributeNames).toEqual({ '#topics': 'topics' })
        expect(request.params.ExpressionAttributeValues).toEqual({
          ':topics': {
            SS: ['newTopic', 'newTopic2'],
          },
        })
      })
    })
  })

  describe('multiple operations', () => {
    it('b', () => {
      const now = moment()

      const request = new UpdateRequest(<any>null, UpdateModel, getTableName(UpdateModel), 'myId', now)
      request.operations(update<UpdateModel>('active').set(true), update<UpdateModel>('name').set('newName'))

      expect(request.params.UpdateExpression).toBe('SET #active = :active, #name = :name')
      expect(request.params.ExpressionAttributeNames).toEqual({ '#active': 'isActive', '#name': 'name' })
      expect(request.params.ExpressionAttributeValues).toEqual({
        ':active': { BOOL: true },
        ':name': { S: 'newName' },
      })
    })
  })
})
