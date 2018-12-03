import { getTableName } from '../../../test/helper'
import { Address, SimpleWithCompositePartitionKeyModel, UpdateModel } from '../../../test/models'
import { FormId, FormType, Order, OrderId } from '../../../test/models/real-world'
import { not, update2 } from '../expression/logical-operator'
import { attribute } from '../expression/logical-operator/attribute.function'
import { update } from '../expression/logical-operator/update.function'
import { UpdateOperation } from './update.operation'

describe('update operation', () => {
  describe('constructor', () => {
    it('should throw when no sortKey was given but necessary', () => {
      expect(() => new UpdateOperation(SimpleWithCompositePartitionKeyModel, 'tableNameVal', 'myId')).toThrow()
    })

    it('should create correct initial params', () => {
      const now = new Date()
      const updateOp = new UpdateOperation(SimpleWithCompositePartitionKeyModel, 'tableNameVal', 'myId', now)

      expect(updateOp.params).toBeDefined()
      expect(updateOp.params.TableName).toBe('tableNameVal')
      expect(updateOp.params.Key).toEqual({
        id: { S: 'myId' },
        creationDate: { S: now.toISOString() },
      })
    })
  })

  describe('update expression', () => {
    describe('single operation', () => {
      it('incrementBy', () => {
        const now = new Date()

        const updateOp = new UpdateOperation(UpdateModel, getTableName(UpdateModel), 'myId', now)
        updateOp.operations(update<UpdateModel>('counter').incrementBy(5))

        expect(updateOp.params.UpdateExpression).toBe('SET #counter = #counter + :counter')
        expect(updateOp.params.ExpressionAttributeNames).toEqual({ '#counter': 'counter' })
        expect(updateOp.params.ExpressionAttributeValues).toEqual({ ':counter': { N: '5' } })
      })

      it('decrementBy', () => {
        const now = new Date()

        const updateOp = new UpdateOperation(UpdateModel, getTableName(UpdateModel), 'myId', now)
        updateOp.operations(update<UpdateModel>('counter').decrementBy(5))

        expect(updateOp.params.UpdateExpression).toBe('SET #counter = #counter - :counter')
        expect(updateOp.params.ExpressionAttributeNames).toEqual({ '#counter': 'counter' })
        expect(updateOp.params.ExpressionAttributeValues).toEqual({ ':counter': { N: '5' } })
      })

      it('set', () => {
        const now = new Date()

        const updateOp = new UpdateOperation(UpdateModel, getTableName(UpdateModel), 'myId', now)

        updateOp.operations(update<UpdateModel>('lastUpdated').set(now))

        expect(updateOp.params.UpdateExpression).toBe('SET #lastUpdated = :lastUpdated')
        expect(updateOp.params.ExpressionAttributeNames).toEqual({ '#lastUpdated': 'lastUpdated' })
        expect(updateOp.params.ExpressionAttributeValues).toEqual({
          ':lastUpdated': {
            S: now.toISOString(),
          },
        })
      })

      it('set (nested map)', () => {
        const now = new Date()

        const updateOp = new UpdateOperation(UpdateModel, getTableName(UpdateModel), 'myId', now)

        updateOp.operations(update('info.details').set('the new detail'))

        expect(updateOp.params.UpdateExpression).toBe('SET #info.#details = :info__details')
        expect(updateOp.params.ExpressionAttributeNames).toEqual({ '#info': 'info', '#details': 'details' })
        expect(updateOp.params.ExpressionAttributeValues).toEqual({
          ':info__details': {
            S: 'the new detail',
          },
        })
      })

      it('set (list)', () => {
        const now = new Date()
        const updateOp = new UpdateOperation(UpdateModel, getTableName(UpdateModel), 'myId', now)

        updateOp.operations(update('addresses[1]').set({ street: 'Bond Street', place: 'London', zip: 25650 }))

        expect(updateOp.params.UpdateExpression).toBe('SET #addresses[1] = :addresses_at_1')
        expect(updateOp.params.ExpressionAttributeNames).toEqual({ '#addresses': 'addresses' })
        expect(updateOp.params.ExpressionAttributeValues).toEqual({
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
        const updateOp = new UpdateOperation(UpdateModel, getTableName(UpdateModel), 'myId', now)

        updateOp.operations(update<UpdateModel>('numberValues').appendToList([5]))

        expect(updateOp.params.UpdateExpression).toBe('SET #numberValues = list_append(#numberValues, :numberValues)')
        expect(updateOp.params.ExpressionAttributeNames).toEqual({ '#numberValues': 'numberValues' })
        expect(updateOp.params.ExpressionAttributeValues).toEqual({
          ':numberValues': {
            L: [{ N: '5' }],
          },
        })
      })

      it('append to list (default position)', () => {
        const now = new Date()
        const updateOp = new UpdateOperation(UpdateModel, getTableName(UpdateModel), 'myId', now)

        const newAddress: Address = { street: 'The street', place: 'London', zip: 15241 }
        updateOp.operations(update<UpdateModel>('addresses').appendToList([newAddress]))

        expect(updateOp.params.UpdateExpression).toBe('SET #addresses = list_append(#addresses, :addresses)')
        expect(updateOp.params.ExpressionAttributeNames).toEqual({ '#addresses': 'addresses' })
        expect(updateOp.params.ExpressionAttributeValues).toEqual({
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
        const updateOp = new UpdateOperation(UpdateModel, getTableName(UpdateModel), 'myId', now)

        const newAddress: Address = { street: 'The street', place: 'London', zip: 15241 }
        updateOp.operations(update<UpdateModel>('addresses').appendToList([newAddress], 'END'))

        expect(updateOp.params.UpdateExpression).toBe('SET #addresses = list_append(#addresses, :addresses)')
        expect(updateOp.params.ExpressionAttributeNames).toEqual({ '#addresses': 'addresses' })
        expect(updateOp.params.ExpressionAttributeValues).toEqual({
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
        const updateOp = new UpdateOperation(UpdateModel, getTableName(UpdateModel), 'myId', now)

        const newAddress: Address = { street: 'The street', place: 'London', zip: 15241 }
        updateOp.operations(update<UpdateModel>('addresses').appendToList([newAddress], 'START'))

        expect(updateOp.params.UpdateExpression).toBe('SET #addresses = list_append(:addresses, #addresses)')
        expect(updateOp.params.ExpressionAttributeNames).toEqual({ '#addresses': 'addresses' })
        expect(updateOp.params.ExpressionAttributeValues).toEqual({
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
        const updateOp = new UpdateOperation(UpdateModel, getTableName(UpdateModel), 'myId', now)

        updateOp.operations(update<UpdateModel>('counter').remove(), update<UpdateModel>('name').remove())

        expect(updateOp.params.UpdateExpression).toBe('REMOVE #counter, #name')
        expect(updateOp.params.ExpressionAttributeNames).toEqual({ '#counter': 'counter', '#name': 'name' })
        expect(updateOp.params.ExpressionAttributeValues).toBeUndefined()
      })

      it('remove from list at (single)', () => {
        const now = new Date()
        const updateOp = new UpdateOperation(UpdateModel, getTableName(UpdateModel), 'myId', now)

        updateOp.operations(update<UpdateModel>('addresses').removeFromListAt(2))

        expect(updateOp.params.UpdateExpression).toBe('REMOVE #addresses[2]')
        expect(updateOp.params.ExpressionAttributeNames).toEqual({ '#addresses': 'addresses' })
        expect(updateOp.params.ExpressionAttributeValues).toBeUndefined()
      })

      it('remove from list at (many)', () => {
        const now = new Date()
        const updateOp = new UpdateOperation(UpdateModel, getTableName(UpdateModel), 'myId', now)

        updateOp.operations(update<UpdateModel>('addresses').removeFromListAt(2, 5, 6))

        expect(updateOp.params.UpdateExpression).toBe('REMOVE #addresses[2], #addresses[5], #addresses[6]')
        expect(updateOp.params.ExpressionAttributeNames).toEqual({ '#addresses': 'addresses' })
        expect(updateOp.params.ExpressionAttributeValues).toBeUndefined()
      })

      it('add (multiple arr)', () => {
        const now = new Date()
        const updateOp = new UpdateOperation(UpdateModel, getTableName(UpdateModel), 'myId', now)

        updateOp.operations(update<UpdateModel>('topics').add(['newTopic', 'newTopic2']))

        expect(updateOp.params.UpdateExpression).toBe('ADD #topics :topics')
        expect(updateOp.params.ExpressionAttributeNames).toEqual({ '#topics': 'topics' })
        expect(updateOp.params.ExpressionAttributeValues).toEqual({
          ':topics': {
            SS: ['newTopic', 'newTopic2'],
          },
        })
      })

      it('add (multiple set)', () => {
        const now = new Date()
        const updateOp = new UpdateOperation(UpdateModel, getTableName(UpdateModel), 'myId', now)

        updateOp.operations(update<UpdateModel>('topics').add(new Set(['newTopic', 'newTopic2'])))

        expect(updateOp.params.UpdateExpression).toBe('ADD #topics :topics')
        expect(updateOp.params.ExpressionAttributeNames).toEqual({ '#topics': 'topics' })
        expect(updateOp.params.ExpressionAttributeValues).toEqual({
          ':topics': {
            SS: ['newTopic', 'newTopic2'],
          },
        })
      })

      it('add (multiple vararg)', () => {
        const now = new Date()
        const updateOp = new UpdateOperation(UpdateModel, getTableName(UpdateModel), 'myId', now)

        updateOp.operations(update<UpdateModel>('topics').add('newTopic', 'newTopic2'))

        expect(updateOp.params.UpdateExpression).toBe('ADD #topics :topics')
        expect(updateOp.params.ExpressionAttributeNames).toEqual({ '#topics': 'topics' })
        expect(updateOp.params.ExpressionAttributeValues).toEqual({
          ':topics': {
            SS: ['newTopic', 'newTopic2'],
          },
        })
      })

      it('add (single)', () => {
        const now = new Date()
        const updateOp = new UpdateOperation(UpdateModel, getTableName(UpdateModel), 'myId', now)

        updateOp.operations(update<UpdateModel>('topics').add('newTopic'))

        expect(updateOp.params.UpdateExpression).toBe('ADD #topics :topics')
        expect(updateOp.params.ExpressionAttributeNames).toEqual({ '#topics': 'topics' })
        expect(updateOp.params.ExpressionAttributeValues).toEqual({
          ':topics': {
            SS: ['newTopic'],
          },
        })
      })

      it('remove from set (single)', () => {
        const now = new Date()
        const updateOp = new UpdateOperation(UpdateModel, getTableName(UpdateModel), 'myId', now)

        updateOp.operations(update<UpdateModel>('topics').removeFromSet('newTopic'))

        expect(updateOp.params.UpdateExpression).toBe('DELETE #topics :topics')
        expect(updateOp.params.ExpressionAttributeNames).toEqual({ '#topics': 'topics' })
        expect(updateOp.params.ExpressionAttributeValues).toEqual({
          ':topics': {
            SS: ['newTopic'],
          },
        })
      })

      it('remove from set (multiple vararg)', () => {
        const now = new Date()
        const updateOp = new UpdateOperation(UpdateModel, getTableName(UpdateModel), 'myId', now)

        updateOp.operations(update<UpdateModel>('topics').removeFromSet('newTopic', 'newTopic2'))

        expect(updateOp.params.UpdateExpression).toBe('DELETE #topics :topics')
        expect(updateOp.params.ExpressionAttributeNames).toEqual({ '#topics': 'topics' })
        expect(updateOp.params.ExpressionAttributeValues).toEqual({
          ':topics': {
            SS: ['newTopic', 'newTopic2'],
          },
        })
      })

      it('remove from set (multiple arr)', () => {
        const now = new Date()
        const updateOp = new UpdateOperation(UpdateModel, getTableName(UpdateModel), 'myId', now)

        updateOp.operations(update<UpdateModel>('topics').removeFromSet(['newTopic', 'newTopic2']))

        expect(updateOp.params.UpdateExpression).toBe('DELETE #topics :topics')
        expect(updateOp.params.ExpressionAttributeNames).toEqual({ '#topics': 'topics' })
        expect(updateOp.params.ExpressionAttributeValues).toEqual({
          ':topics': {
            SS: ['newTopic', 'newTopic2'],
          },
        })
      })

      it('remove from set (multiple set)', () => {
        const now = new Date()
        const updateOp = new UpdateOperation(UpdateModel, getTableName(UpdateModel), 'myId', now)

        updateOp.operations(update<UpdateModel>('topics').removeFromSet(new Set(['newTopic', 'newTopic2'])))

        expect(updateOp.params.UpdateExpression).toBe('DELETE #topics :topics')
        expect(updateOp.params.ExpressionAttributeNames).toEqual({ '#topics': 'topics' })
        expect(updateOp.params.ExpressionAttributeValues).toEqual({
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

      const updateOp = new UpdateOperation(UpdateModel, getTableName(UpdateModel), 'myId', now)
      updateOp.operations(update<UpdateModel>('active').set(true), update<UpdateModel>('name').set('newName'))

      expect(updateOp.params.UpdateExpression).toBe('SET #active = :active, #name = :name')
      expect(updateOp.params.ExpressionAttributeNames).toEqual({ '#active': 'isActive', '#name': 'name' })
      expect(updateOp.params.ExpressionAttributeValues).toEqual({
        ':active': { BOOL: true },
        ':name': { S: 'newName' },
      })
    })

    it('mixed types (SET, ADD)', () => {
      const now = new Date()

      const updateOp = new UpdateOperation(UpdateModel, getTableName(UpdateModel), 'myId', now)
      updateOp.operations(
        update<UpdateModel>('active').set(true),
        update<UpdateModel>('name').set('newName'),
        update<UpdateModel>('topics').add('myTopic'),
      )

      expect(updateOp.params.UpdateExpression).toBe('SET #active = :active, #name = :name ADD #topics :topics')
      expect(updateOp.params.ExpressionAttributeNames).toEqual({
        '#active': 'isActive',
        '#name': 'name',
        '#topics': 'topics',
      })
      expect(updateOp.params.ExpressionAttributeValues).toEqual({
        ':active': { BOOL: true },
        ':name': { S: 'newName' },
        ':topics': { SS: ['myTopic'] },
      })
    })

    it('with where clause', () => {
      const now = new Date()

      const updateOp = new UpdateOperation(UpdateModel, getTableName(UpdateModel), 'myId', now)
      updateOp
        .operations(update<UpdateModel>('active').set(true), update<UpdateModel>('name').set('newName'))
        .onlyIf(not(attribute('topics').contains('otherTopic')))

      expect(updateOp.params.UpdateExpression).toBe('SET #active = :active, #name = :name')
      expect(updateOp.params.ExpressionAttributeNames).toEqual({
        '#active': 'isActive',
        '#name': 'name',
        '#topics': 'topics',
      })
      expect(updateOp.params.ExpressionAttributeValues).toEqual({
        ':active': { BOOL: true },
        ':name': { S: 'newName' },
        ':topics': { S: 'otherTopic' },
      })
      expect(updateOp.params.ConditionExpression).toBe('(NOT contains (#topics, :topics))')
    })

    it('with name conflicting where clause', () => {
      const now = new Date()

      const updateOp = new UpdateOperation(UpdateModel, getTableName(UpdateModel), 'myId', now)
      updateOp
        .operations(
          update<UpdateModel>('active').set(true),
          update<UpdateModel>('name').set('newName'),
          update<UpdateModel>('topics').add('myTopic'),
        )
        .onlyIf(not(attribute('topics').contains('otherTopic')))
      // .onlyIfAttribute('topics').notContains('otherTopic')

      expect(updateOp.params.UpdateExpression).toBe('SET #active = :active, #name = :name ADD #topics :topics')
      expect(updateOp.params.ExpressionAttributeNames).toEqual({
        '#active': 'isActive',
        '#name': 'name',
        '#topics': 'topics',
      })
      expect(updateOp.params.ExpressionAttributeValues).toEqual({
        ':active': { BOOL: true },
        ':name': { S: 'newName' },
        ':topics': { SS: ['myTopic'] },
        ':topics_2': { S: 'otherTopic' },
      })
      expect(updateOp.params.ConditionExpression).toBe('(NOT contains (#topics, :topics_2))')
    })
  })

  describe('real world scenario', () => {
    it('should create correct update statement', () => {
      const updateOp = new UpdateOperation(Order, getTableName(Order), new OrderId(5, 2018))

      const u1 = update2(Order, 'types').add([FormType.INVOICE])
      const u2 = update2(Order, 'formIds').appendToList([new FormId(FormType.DELIVERY, 5, 2018)])

      const c1 = attribute<Order>('types').attributeExists()
      const c2 = attribute<Order>('formIds').attributeExists()
      updateOp.operations(u1, u2).onlyIf(c1, c2)

      expect(updateOp.params.UpdateExpression).toBe('ADD #types :types SET #formIds = list_append(#formIds, :formIds)')
      expect(updateOp.params.ExpressionAttributeNames).toEqual({
        '#types': 'types',
        '#formIds': 'formIds',
      })
      expect(updateOp.params.ExpressionAttributeValues).toEqual({
        ':types': { NS: ['5'] },
        ':formIds': { L: [{ S: 'LS00052018' }] },
      })
      expect(updateOp.params.ConditionExpression).toEqual('(attribute_exists (#types) AND attribute_exists (#formIds))')
    })
  })
})
