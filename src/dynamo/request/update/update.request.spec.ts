import * as moment from 'moment'
import { getTableName } from '../../../../test/helper/get-table-name.function'
import { ComplexModel } from '../../../../test/models/complex.model'
import { UpdateModel } from '../../../../test/models/update.model'
import { DynamoStore } from '../../dynamo-store'
import { attribute } from '../../expression/logical-operator/attribute.function'
import { update } from '../../expression/logical-operator/update.function'
import { UpdateRequest } from './update.request'

fdescribe('update request', () => {
  describe('update expression', () => {
    describe('single operation', () => {
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

      it('incrementBy', () => {
        const now = moment()

        const request = new UpdateRequest(<any>null, UpdateModel, getTableName(UpdateModel), 'myId', now)
        request.operations(update<UpdateModel>('counter').incrementBy(5))

        expect(request.params.UpdateExpression).toBe('SET #counter = #counter + :counter')
        expect(request.params.ExpressionAttributeNames).toEqual({ '#counter': 'counter' })
        expect(request.params.ExpressionAttributeValues).toEqual({ ':counter': { N: '5' } })
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
})
