import * as DynamoDB from 'aws-sdk/clients/dynamodb'
import { Address, UpdateModel } from '../../../test/models/index'
import { FormId, FormType, Order, OrderId } from '../../../test/models/real-world/index'
import { Metadata, metadataForClass } from '../../decorator/metadata/index'
import { createKeyAttributes } from '../../mapper'
import { and, not, update2 } from './logical-operator/index'
import { attribute } from './logical-operator/attribute.function'
import { update } from './logical-operator/update.function'
import { addExpression } from './param-util'
import { getTableName } from '../get-table-name.function'
import { prepareAndAddUpdateExpressions } from './prepare-and-add-update-expressions.function'

describe('PrepareExpressions function', () => {
  describe('update expression', () => {
    describe('single operation', () => {
      let metadata: Metadata<UpdateModel>
      let params: DynamoDB.UpdateItemInput | DynamoDB.Update

      beforeEach(() => {
        metadata = metadataForClass(UpdateModel)
        params = {
          TableName: getTableName(metadata),
          Key: createKeyAttributes(metadata, 'myId'),
        }
      })

      it('incrementBy', () => {
        prepareAndAddUpdateExpressions(metadata, params, [update<UpdateModel>('counter').incrementBy(5)])
        expect(params.UpdateExpression).toBe('SET #counter = #counter + :counter')
        expect(params.ExpressionAttributeNames).toEqual({ '#counter': 'counter' })
        expect(params.ExpressionAttributeValues).toEqual({ ':counter': { N: '5' } })
      })

      it('decrementBy', () => {
        prepareAndAddUpdateExpressions(metadata, params, [update<UpdateModel>('counter').decrementBy(5)])

        expect(params.UpdateExpression).toBe('SET #counter = #counter - :counter')
        expect(params.ExpressionAttributeNames).toEqual({ '#counter': 'counter' })
        expect(params.ExpressionAttributeValues).toEqual({ ':counter': { N: '5' } })
      })

      it('set', () => {
        const now = new Date()

        prepareAndAddUpdateExpressions(metadata, params, [update<UpdateModel>('lastUpdated').set(now)])

        expect(params.UpdateExpression).toBe('SET #lastUpdated = :lastUpdated')
        expect(params.ExpressionAttributeNames).toEqual({ '#lastUpdated': 'lastUpdated' })
        expect(params.ExpressionAttributeValues).toEqual({
          ':lastUpdated': {
            S: now.toISOString(),
          },
        })
      })

      it('set (ifNotExists)', () => {
        const now = new Date()

        prepareAndAddUpdateExpressions(metadata, params, [update<UpdateModel>('lastUpdated').set(now, true)])
        expect(params.UpdateExpression).toBe('SET #lastUpdated = if_not_exists(#lastUpdated, :lastUpdated)')
        expect(params.ExpressionAttributeNames).toEqual({ '#lastUpdated': 'lastUpdated' })
        expect(params.ExpressionAttributeValues).toEqual({
          ':lastUpdated': {
            S: now.toISOString(),
          },
        })
      })

      it('set (nested map)', () => {
        prepareAndAddUpdateExpressions(metadata, params, [update('info.details').set('the new detail')])
        expect(params.UpdateExpression).toBe('SET #info.#details = :info__details')
        expect(params.ExpressionAttributeNames).toEqual({ '#info': 'info', '#details': 'details' })
        expect(params.ExpressionAttributeValues).toEqual({
          ':info__details': {
            S: 'the new detail',
          },
        })
      })

      it('set (list)', () => {
        prepareAndAddUpdateExpressions(metadata, params, [
          update('addresses[1]').set({ street: 'Bond Street', place: 'London', zip: 25650 }),
        ])
        expect(params.UpdateExpression).toBe('SET #addresses[1] = :addresses_at_1')
        expect(params.ExpressionAttributeNames).toEqual({ '#addresses': 'addresses' })
        expect(params.ExpressionAttributeValues).toEqual({
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
        prepareAndAddUpdateExpressions(metadata, params, [update<UpdateModel>('numberValues').appendToList([5])])
        expect(params.UpdateExpression).toBe('SET #numberValues = list_append(#numberValues, :numberValues)')
        expect(params.ExpressionAttributeNames).toEqual({ '#numberValues': 'numberValues' })
        expect(params.ExpressionAttributeValues).toEqual({
          ':numberValues': {
            L: [{ N: '5' }],
          },
        })
      })

      it('append to list (default position)', () => {
        const newAddress: Address = { street: 'The street', place: 'London', zip: 15241 }
        prepareAndAddUpdateExpressions(metadata, params, [update<UpdateModel>('addresses').appendToList([newAddress])])
        expect(params.UpdateExpression).toBe('SET #addresses = list_append(#addresses, :addresses)')
        expect(params.ExpressionAttributeNames).toEqual({ '#addresses': 'addresses' })
        expect(params.ExpressionAttributeValues).toEqual({
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
        const newAddress: Address = { street: 'The street', place: 'London', zip: 15241 }
        prepareAndAddUpdateExpressions(metadata, params, [
          update<UpdateModel>('addresses').appendToList([newAddress], 'END'),
        ])
        expect(params.UpdateExpression).toBe('SET #addresses = list_append(#addresses, :addresses)')
        expect(params.ExpressionAttributeNames).toEqual({ '#addresses': 'addresses' })
        expect(params.ExpressionAttributeValues).toEqual({
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
        const newAddress: Address = { street: 'The street', place: 'London', zip: 15241 }
        prepareAndAddUpdateExpressions(metadata, params, [
          update<UpdateModel>('addresses').appendToList([newAddress], 'START'),
        ])

        expect(params.UpdateExpression).toBe('SET #addresses = list_append(:addresses, #addresses)')
        expect(params.ExpressionAttributeNames).toEqual({ '#addresses': 'addresses' })
        expect(params.ExpressionAttributeValues).toEqual({
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
        prepareAndAddUpdateExpressions(metadata, params, [
          update<UpdateModel>('counter').remove(),
          update<UpdateModel>('name').remove(),
        ])

        expect(params.UpdateExpression).toBe('REMOVE #counter, #name')
        expect(params.ExpressionAttributeNames).toEqual({ '#counter': 'counter', '#name': 'name' })
        expect(params.ExpressionAttributeValues).toBeUndefined()
      })

      it('remove from list at (single)', () => {
        prepareAndAddUpdateExpressions(metadata, params, [update<UpdateModel>('addresses').removeFromListAt(2)])
        expect(params.UpdateExpression).toBe('REMOVE #addresses[2]')
        expect(params.ExpressionAttributeNames).toEqual({ '#addresses': 'addresses' })
        expect(params.ExpressionAttributeValues).toBeUndefined()
      })

      it('remove from list at (many)', () => {
        prepareAndAddUpdateExpressions(metadata, params, [update<UpdateModel>('addresses').removeFromListAt(2, 5, 6)])

        expect(params.UpdateExpression).toBe('REMOVE #addresses[2], #addresses[5], #addresses[6]')
        expect(params.ExpressionAttributeNames).toEqual({ '#addresses': 'addresses' })
        expect(params.ExpressionAttributeValues).toBeUndefined()
      })

      it('add (multiple arr)', () => {
        prepareAndAddUpdateExpressions(metadata, params, [update<UpdateModel>('topics').add(['newTopic', 'newTopic2'])])

        expect(params.UpdateExpression).toBe('ADD #topics :topics')
        expect(params.ExpressionAttributeNames).toEqual({ '#topics': 'topics' })
        expect(params.ExpressionAttributeValues).toEqual({
          ':topics': {
            SS: ['newTopic', 'newTopic2'],
          },
        })
      })

      it('add (multiple set)', () => {
        prepareAndAddUpdateExpressions(metadata, params, [
          update2(UpdateModel, 'topics').add(new Set(['newTopic', 'newTopic2'])),
        ])

        expect(params.UpdateExpression).toBe('ADD #topics :topics')
        expect(params.ExpressionAttributeNames).toEqual({ '#topics': 'topics' })
        expect(params.ExpressionAttributeValues).toEqual({
          ':topics': {
            SS: ['newTopic', 'newTopic2'],
          },
        })
      })

      it('add number', () => {
        prepareAndAddUpdateExpressions(metadata, params, [update2(UpdateModel, 'counter').add(4)])

        expect(params.UpdateExpression).toBe('ADD #counter :counter')
        expect(params.ExpressionAttributeNames).toEqual({ '#counter': 'counter' })
        expect(params.ExpressionAttributeValues).toEqual({
          ':counter': {
            N: '4',
          },
        })
      })

      it('remove from set (multiple arr)', () => {
        prepareAndAddUpdateExpressions(metadata, params, [
          update<UpdateModel>('topics').removeFromSet(['newTopic', 'newTopic2']),
        ])

        expect(params.UpdateExpression).toBe('DELETE #topics :topics')
        expect(params.ExpressionAttributeNames).toEqual({ '#topics': 'topics' })
        expect(params.ExpressionAttributeValues).toEqual({
          ':topics': {
            SS: ['newTopic', 'newTopic2'],
          },
        })
      })

      it('remove from set (multiple set)', () => {
        prepareAndAddUpdateExpressions(metadata, params, [
          update<UpdateModel>('topics').removeFromSet(new Set(['newTopic', 'newTopic2'])),
        ])

        expect(params.UpdateExpression).toBe('DELETE #topics :topics')
        expect(params.ExpressionAttributeNames).toEqual({ '#topics': 'topics' })
        expect(params.ExpressionAttributeValues).toEqual({
          ':topics': {
            SS: ['newTopic', 'newTopic2'],
          },
        })
      })
    })

    describe('multiple operations', () => {
      let metadata: Metadata<UpdateModel>
      let params: DynamoDB.UpdateItemInput | DynamoDB.Update

      beforeEach(() => {
        metadata = metadataForClass(UpdateModel)
        params = {
          TableName: getTableName(metadata),
          Key: createKeyAttributes(metadata, 'myId'),
        }
      })

      it('one type (SET)', () => {
        prepareAndAddUpdateExpressions(metadata, params, [
          update<UpdateModel>('active').set(true),
          update<UpdateModel>('name').set('newName'),
        ])

        expect(params.UpdateExpression).toBe('SET #active = :active, #name = :name')
        expect(params.ExpressionAttributeNames).toEqual({ '#active': 'isActive', '#name': 'name' })
        expect(params.ExpressionAttributeValues).toEqual({
          ':active': { BOOL: true },
          ':name': { S: 'newName' },
        })
      })

      it('mixed types (SET, ADD)', () => {
        prepareAndAddUpdateExpressions(metadata, params, [
          update<UpdateModel>('active').set(true),
          update<UpdateModel>('name').set('newName'),
          update<UpdateModel>('topics').add(['myTopic']),
        ])

        expect(params.UpdateExpression).toBe('SET #active = :active, #name = :name ADD #topics :topics')
        expect(params.ExpressionAttributeNames).toEqual({
          '#active': 'isActive',
          '#name': 'name',
          '#topics': 'topics',
        })
        expect(params.ExpressionAttributeValues).toEqual({
          ':active': { BOOL: true },
          ':name': { S: 'newName' },
          ':topics': { SS: ['myTopic'] },
        })
      })

      it('with where clause', () => {
        prepareAndAddUpdateExpressions(metadata, params, [
          update<UpdateModel>('active').set(true),
          update<UpdateModel>('name').set('newName'),
        ])
        const condition = and(not(attribute('topics').contains('otherTopic')))(undefined, metadata)
        addExpression('ConditionExpression', condition, params)

        expect(params.UpdateExpression).toBe('SET #active = :active, #name = :name')
        expect(params.ExpressionAttributeNames).toEqual({
          '#active': 'isActive',
          '#name': 'name',
          '#topics': 'topics',
        })
        expect(params.ExpressionAttributeValues).toEqual({
          ':active': { BOOL: true },
          ':name': { S: 'newName' },
          ':topics': { S: 'otherTopic' },
        })
        expect(params.ConditionExpression).toBe('(NOT contains (#topics, :topics))')
      })

      it('with name conflicting where clause', () => {
        prepareAndAddUpdateExpressions(metadata, params, [
          update<UpdateModel>('active').set(true),
          update<UpdateModel>('name').set('newName'),
          update<UpdateModel>('topics').add(['myTopic']),
        ])
        const condition = and(not(attribute('topics').contains('otherTopic')))(undefined, metadata)
        addExpression('ConditionExpression', condition, params)

        expect(params.UpdateExpression).toBe('SET #active = :active, #name = :name ADD #topics :topics')
        expect(params.ExpressionAttributeNames).toEqual({
          '#active': 'isActive',
          '#name': 'name',
          '#topics': 'topics',
        })
        expect(params.ExpressionAttributeValues).toEqual({
          ':active': { BOOL: true },
          ':name': { S: 'newName' },
          ':topics': { SS: ['myTopic'] },
          ':topics_2': { S: 'otherTopic' },
        })
        expect(params.ConditionExpression).toBe('(NOT contains (#topics, :topics_2))')
      })
    })
  })

  describe('real world scenario', () => {
    let metadata: Metadata<Order>
    let params: DynamoDB.UpdateItemInput | DynamoDB.Update

    beforeEach(() => {
      metadata = metadataForClass(Order)
      params = {
        TableName: getTableName(metadata),
        Key: createKeyAttributes(metadata, new OrderId(5, 2018)),
      }
    })

    it('should create correct update statement', () => {
      prepareAndAddUpdateExpressions(metadata, params, [
        update2(Order, 'types').add([FormType.INVOICE]),
        update2(Order, 'formIds').appendToList([new FormId(FormType.DELIVERY, 5, 2018)]),
      ])

      const condition = and(attribute<Order>('types').attributeExists(), attribute<Order>('formIds').attributeExists())(
        undefined,
        metadata,
      )
      addExpression('ConditionExpression', condition, params)

      expect(params.UpdateExpression).toBe('ADD #types :types SET #formIds = list_append(#formIds, :formIds)')
      expect(params.ExpressionAttributeNames).toEqual({
        '#types': 'types',
        '#formIds': 'formIds',
      })
      expect(params.ExpressionAttributeValues).toEqual({
        ':types': { NS: ['5'] },
        ':formIds': { L: [{ S: 'LS00052018' }] },
      })
      expect(params.ConditionExpression).toEqual('(attribute_exists (#types) AND attribute_exists (#formIds))')
    })
  })
})
