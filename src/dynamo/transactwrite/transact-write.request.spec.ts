// tslint:disable:no-non-null-assertion
import { SimpleWithPartitionKeyModel } from '../../../test/models'
import { attribute } from '../expression/logical-operator/attribute.function'
import { update } from '../expression/logical-operator/update.function'
import { getTableName } from '../get-table-name.function'
import { TransactConditionCheck } from './transact-condition-check'
import { TransactDelete } from './transact-delete'
import { TransactPut } from './transact-put'
import { TransactWriteRequest } from './transact-write.request'
import { TransactUpdate } from './transact-update'

describe('TransactWriteRequest', () => {
  describe('correct params', () => {
    let req: TransactWriteRequest

    beforeEach(() => (req = new TransactWriteRequest()))

    it('returnConsumedCapacity', () => {
      req.returnConsumedCapacity('TOTAL')
      expect(req.params.ReturnConsumedCapacity).toBe('TOTAL')
    })

    it('returnItemCollectionMetrics', () => {
      req.returnItemCollectionMetrics('SIZE')
      expect(req.params.ReturnItemCollectionMetrics).toBe('SIZE')
    })

    it('should add TransactPut operation', () => {
      req.transact(new TransactPut(SimpleWithPartitionKeyModel, { id: 'myId', age: 20 }))

      expect(req.params.TransactItems.length).toBe(1)
      expect(req.params.TransactItems[0]).toEqual({
        Put: {
          TableName: getTableName(SimpleWithPartitionKeyModel),
          Item: { id: { S: 'myId' }, age: { N: '20' } },
        },
      })
    })

    it('should add TransactDelete operation', () => {
      req.transact(new TransactDelete(SimpleWithPartitionKeyModel, 'myId'))

      expect(req.params.TransactItems.length).toBe(1)
      expect(req.params.TransactItems[0]).toEqual({
        Delete: {
          TableName: getTableName(SimpleWithPartitionKeyModel),
          Key: { id: { S: 'myId' } },
        },
      })
    })

    it('should add TransactUpdate operation', () => {
      req.transact(
        new TransactUpdate(SimpleWithPartitionKeyModel, 'myId').operations(
          update<SimpleWithPartitionKeyModel>('age').set(22),
        ),
      )

      expect(req.params.TransactItems.length).toBe(1)
      expect(req.params.TransactItems[0].Update).toBeDefined()
      expect(req.params.TransactItems[0].Update!.TableName).toBe(getTableName(SimpleWithPartitionKeyModel))
      expect(req.params.TransactItems[0].Update!.Key).toEqual({ id: { S: 'myId' } })
    })

    it('should add TransactConditionCheck operation', () => {
      req.transact(new TransactConditionCheck(SimpleWithPartitionKeyModel, 'myId').onlyIf(attribute('age').gt(18)))

      expect(req.params.TransactItems.length).toBe(1)
      expect(req.params.TransactItems[0].ConditionCheck).toBeDefined()
      expect(req.params.TransactItems[0].ConditionCheck!.TableName).toBe(getTableName(SimpleWithPartitionKeyModel))
      expect(req.params.TransactItems[0].ConditionCheck!.Key).toEqual({ id: { S: 'myId' } })
    })

    it('multiple transact', () => {
      req.transact(
        new TransactConditionCheck(SimpleWithPartitionKeyModel, 'check-ID').onlyIf(attribute('age').gt(18)),
        new TransactDelete(SimpleWithPartitionKeyModel, 'del-ID'),
        new TransactPut(SimpleWithPartitionKeyModel, { id: 'put-ID-1', age: 21 }),
        new TransactPut(SimpleWithPartitionKeyModel, { id: 'put-ID-2', age: 22 }),
      )

      expect(req.params.TransactItems.length).toBe(4)
      expect(req.params.TransactItems[0].ConditionCheck).toBeDefined()
      expect(req.params.TransactItems[1].Delete).toBeDefined()
      expect(req.params.TransactItems[2].Put).toBeDefined()
      expect(req.params.TransactItems[3].Put).toBeDefined()

      expect(req.params.TransactItems[0].ConditionCheck!.Key).toEqual({ id: { S: 'check-ID' } })
      expect(req.params.TransactItems[1].Delete!.Key).toEqual({ id: { S: 'del-ID' } })
      expect(req.params.TransactItems[2].Put!.Item).toEqual({ id: { S: 'put-ID-1' }, age: { N: '21' } })
      expect(req.params.TransactItems[3].Put!.Item).toEqual({ id: { S: 'put-ID-2' }, age: { N: '22' } })
    })

    it('should throw when too many conditions are given in one step', () => {
      const ops = Array(11).map((_, i) => new TransactDelete(SimpleWithPartitionKeyModel, `id-${i}`))
      expect(() => req.transact(...ops)).toThrow()
    })
  })
})
