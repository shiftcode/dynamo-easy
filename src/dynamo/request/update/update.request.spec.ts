import { getTableName } from '../../../../test/helper'
import { Address, UpdateModel } from '../../../../test/models'
import { FormId, FormType, Order } from '../../../../test/models/real-world'
import { attribute, not, update, update2 } from '../../expression'
import { UpdateRequest } from './update.request'

describe('update request', () => {
  describe('update expression', () => {
    describe('single operation', () => {
      it('incrementBy', () => {
        const now = new Date()

        const request = new UpdateRequest(<any>null, UpdateModel, getTableName(UpdateModel), 'myId', now)
        request.operations(update<UpdateModel>('counter').incrementBy(5))

        expect(request.params.UpdateExpression).toBe('SET #counter = #counter + :counter')
        expect(request.params.ExpressionAttributeNames).toEqual({ '#counter': 'counter' })
        expect(request.params.ExpressionAttributeValues).toEqual({ ':counter': { N: '5' } })
      })

      it('decrementBy', () => {
        const now = new Date()

        const request = new UpdateRequest(<any>null, UpdateModel, getTableName(UpdateModel), 'myId', now)
        request.operations(update<UpdateModel>('counter').decrementBy(5))

        expect(request.params.UpdateExpression).toBe('SET #counter = #counter - :counter')
        expect(request.params.ExpressionAttributeNames).toEqual({ '#counter': 'counter' })
        expect(request.params.ExpressionAttributeValues).toEqual({ ':counter': { N: '5' } })
      })

      it('set', () => {
        const now = new Date()

        const request = new UpdateRequest(<any>null, UpdateModel, getTableName(UpdateModel), 'myId', now)

        request.operations(update<UpdateModel>('lastUpdated').set(now))

        expect(request.params.UpdateExpression).toBe('SET #lastUpdated = :lastUpdated')
        expect(request.params.ExpressionAttributeNames).toEqual({ '#lastUpdated': 'lastUpdated' })
        expect(request.params.ExpressionAttributeValues).toEqual({
          ':lastUpdated': {
            S: now.toISOString(),
          },
        })
      })

      it('set (nested map)', () => {
        const now = new Date()

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
        const now = new Date()
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

      it('append to list simple (default position)', () => {
        const now = new Date()
        const request = new UpdateRequest(<any>null, UpdateModel, getTableName(UpdateModel), 'myId', now)

        request.operations(update<UpdateModel>('numberValues').appendToList([5]))

        expect(request.params.UpdateExpression).toBe('SET #numberValues = list_append(#numberValues, :numberValues)')
        expect(request.params.ExpressionAttributeNames).toEqual({ '#numberValues': 'numberValues' })
        expect(request.params.ExpressionAttributeValues).toEqual({
          ':numberValues': {
            L: [{ N: '5' }],
          },
        })
      })

      it('append to list (default position)', () => {
        const now = new Date()
        const request = new UpdateRequest(<any>null, UpdateModel, getTableName(UpdateModel), 'myId', now)

        const newAddress: Address = { street: 'The street', place: 'London', zip: 15241 }
        request.operations(update<UpdateModel>('addresses').appendToList([newAddress]))

        expect(request.params.UpdateExpression).toBe('SET #addresses = list_append(#addresses, :addresses)')
        expect(request.params.ExpressionAttributeNames).toEqual({ '#addresses': 'addresses' })
        expect(request.params.ExpressionAttributeValues).toEqual({
          ':addresses': {
            L: [
              {
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
            ],
          },
        })
      })

      it('append to list (position = END)', () => {
        const now = new Date()
        const request = new UpdateRequest(<any>null, UpdateModel, getTableName(UpdateModel), 'myId', now)

        const newAddress: Address = { street: 'The street', place: 'London', zip: 15241 }
        request.operations(update<UpdateModel>('addresses').appendToList([newAddress], 'END'))

        expect(request.params.UpdateExpression).toBe('SET #addresses = list_append(#addresses, :addresses)')
        expect(request.params.ExpressionAttributeNames).toEqual({ '#addresses': 'addresses' })
        expect(request.params.ExpressionAttributeValues).toEqual({
          ':addresses': {
            L: [
              {
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
            ],
          },
        })
      })

      it('append to list (position = START)', () => {
        const now = new Date()
        const request = new UpdateRequest(<any>null, UpdateModel, getTableName(UpdateModel), 'myId', now)

        const newAddress: Address = { street: 'The street', place: 'London', zip: 15241 }
        request.operations(update<UpdateModel>('addresses').appendToList([newAddress], 'START'))

        expect(request.params.UpdateExpression).toBe('SET #addresses = list_append(:addresses, #addresses)')
        expect(request.params.ExpressionAttributeNames).toEqual({ '#addresses': 'addresses' })
        expect(request.params.ExpressionAttributeValues).toEqual({
          ':addresses': {
            L: [
              {
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
            ],
          },
        })
      })

      it('remove', () => {
        const now = new Date()
        const request = new UpdateRequest(<any>null, UpdateModel, getTableName(UpdateModel), 'myId', now)

        request.operations(update<UpdateModel>('counter').remove(), update<UpdateModel>('name').remove())

        expect(request.params.UpdateExpression).toBe('REMOVE #counter, #name')
        expect(request.params.ExpressionAttributeNames).toEqual({ '#counter': 'counter', '#name': 'name' })
        expect(request.params.ExpressionAttributeValues).toBeUndefined()
      })

      it('remove from list at (single)', () => {
        const now = new Date()
        const request = new UpdateRequest(<any>null, UpdateModel, getTableName(UpdateModel), 'myId', now)

        request.operations(update<UpdateModel>('addresses').removeFromListAt(2))

        expect(request.params.UpdateExpression).toBe('REMOVE #addresses[2]')
        expect(request.params.ExpressionAttributeNames).toEqual({ '#addresses': 'addresses' })
        expect(request.params.ExpressionAttributeValues).toBeUndefined()
      })

      it('remove from list at (many)', () => {
        const now = new Date()
        const request = new UpdateRequest(<any>null, UpdateModel, getTableName(UpdateModel), 'myId', now)

        request.operations(update<UpdateModel>('addresses').removeFromListAt(2, 5, 6))

        expect(request.params.UpdateExpression).toBe('REMOVE #addresses[2], #addresses[5], #addresses[6]')
        expect(request.params.ExpressionAttributeNames).toEqual({ '#addresses': 'addresses' })
        expect(request.params.ExpressionAttributeValues).toBeUndefined()
      })

      it('add (multiple arr)', () => {
        const now = new Date()
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
        const now = new Date()
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
        const now = new Date()
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
        const now = new Date()
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
        const now = new Date()
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
        const now = new Date()
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
        const now = new Date()
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
        const now = new Date()
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
    it('one type (SET)', () => {
      const now = new Date()

      const request = new UpdateRequest(<any>null, UpdateModel, getTableName(UpdateModel), 'myId', now)
      request.operations(update<UpdateModel>('active').set(true), update<UpdateModel>('name').set('newName'))

      expect(request.params.UpdateExpression).toBe('SET #active = :active, #name = :name')
      expect(request.params.ExpressionAttributeNames).toEqual({ '#active': 'isActive', '#name': 'name' })
      expect(request.params.ExpressionAttributeValues).toEqual({
        ':active': { BOOL: true },
        ':name': { S: 'newName' },
      })
    })

    it('mixed types (SET, ADD)', () => {
      const now = new Date()

      const request = new UpdateRequest(<any>null, UpdateModel, getTableName(UpdateModel), 'myId', now)
      request.operations(
        update<UpdateModel>('active').set(true),
        update<UpdateModel>('name').set('newName'),
        update<UpdateModel>('topics').add('myTopic'),
      )

      expect(request.params.UpdateExpression).toBe('SET #active = :active, #name = :name ADD #topics :topics')
      expect(request.params.ExpressionAttributeNames).toEqual({
        '#active': 'isActive',
        '#name': 'name',
        '#topics': 'topics',
      })
      expect(request.params.ExpressionAttributeValues).toEqual({
        ':active': { BOOL: true },
        ':name': { S: 'newName' },
        ':topics': { SS: ['myTopic'] },
      })
    })

    it('with where clause', () => {
      const now = new Date()

      const request = new UpdateRequest(<any>null, UpdateModel, getTableName(UpdateModel), 'myId', now)
      request
        .operations(update<UpdateModel>('active').set(true), update<UpdateModel>('name').set('newName'))
        .onlyIf(not(attribute('topics').contains('otherTopic')))

      expect(request.params.UpdateExpression).toBe('SET #active = :active, #name = :name')
      expect(request.params.ExpressionAttributeNames).toEqual({
        '#active': 'isActive',
        '#name': 'name',
        '#topics': 'topics',
      })
      expect(request.params.ExpressionAttributeValues).toEqual({
        ':active': { BOOL: true },
        ':name': { S: 'newName' },
        ':topics': { S: 'otherTopic' },
      })
      expect(request.params.ConditionExpression).toBe('(NOT contains (#topics, :topics))')
    })

    it('with name conflicting where clause', () => {
      const now = new Date()

      const request = new UpdateRequest(<any>null, UpdateModel, getTableName(UpdateModel), 'myId', now)
      request
        .operations(
          update<UpdateModel>('active').set(true),
          update<UpdateModel>('name').set('newName'),
          update<UpdateModel>('topics').add('myTopic'),
        )
        .onlyIf(not(attribute('topics').contains('otherTopic')))
      // .onlyIfAttribute('topics').notContains('otherTopic')

      expect(request.params.UpdateExpression).toBe('SET #active = :active, #name = :name ADD #topics :topics')
      expect(request.params.ExpressionAttributeNames).toEqual({
        '#active': 'isActive',
        '#name': 'name',
        '#topics': 'topics',
      })
      expect(request.params.ExpressionAttributeValues).toEqual({
        ':active': { BOOL: true },
        ':name': { S: 'newName' },
        ':topics': { SS: ['myTopic'] },
        ':topics_2': { S: 'otherTopic' },
      })
      expect(request.params.ConditionExpression).toBe('(NOT contains (#topics, :topics_2))')
    })
  })

  describe('real world scenario', () => {
    it('should create correct update statement', () => {
      const request = new UpdateRequest(<any>null, Order, getTableName(Order), 'orderId')

      request
        .operations(
          update2(Order, 'types').add([FormType.INVOICE]),
          update2(Order, 'formIds').appendToList([new FormId(FormType.DELIVERY, 5, 2018)]),
        )
        .onlyIf(attribute<Order>('types').attributeExists(), attribute<Order>('formIds').attributeExists())

      expect(request.params.UpdateExpression).toBe('ADD #types :types SET #formIds = list_append(#formIds, :formIds)')
      expect(request.params.ExpressionAttributeNames).toEqual({
        '#types': 'types',
        '#formIds': 'formIds',
      })
      expect(request.params.ExpressionAttributeValues).toEqual({
        ':types': { NS: ['5'] },
        ':formIds': { L: [{ S: 'LS00052018' }] },
      })
      expect(request.params.ConditionExpression).toEqual('(attribute_exists (#types) AND attribute_exists (#formIds))')
    })
  })
})
