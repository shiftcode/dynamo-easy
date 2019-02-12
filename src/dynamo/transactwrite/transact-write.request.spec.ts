// tslint:disable:no-non-null-assertion
import { SimpleWithPartitionKeyModel } from '../../../test/models'
import { attribute } from '../expression/logical-operator/attribute.function'
import { update } from '../expression/logical-operator/update.function'
import { getTableName } from '../get-table-name.function'
import { TransactConditionCheck } from './transact-condition-check'
import { TransactDelete } from './transact-delete'
import { TransactOperation } from './transact-operation.type'
import { TransactPut } from './transact-put'
import { TransactUpdate } from './transact-update'
import { TransactWriteRequest } from './transact-write.request'

describe('TransactWriteRequest', () => {
  describe('constructor', () => {
    let req: TransactWriteRequest
    beforeEach(() => {
      req = new TransactWriteRequest()
    })

    it('should add transactItems array to params', () => {
      expect(req.params).toEqual({
        TransactItems: [],
      })
    })
  })

  describe('transact', () => {
    let req: TransactWriteRequest
    beforeEach(() => {
      req = new TransactWriteRequest()
    })

    it('should throw when no operations are provided', () => {
      const ops: TransactOperation[] = []
      expect(() => req.transact(...ops)).toThrow()
    })
    it('should throw when too many conditions are given in one step', () => {
      const ops = Array(11).map((_, i) => new TransactDelete(SimpleWithPartitionKeyModel, `id-${i}`))
      expect(() => req.transact(...ops)).toThrow()
    })
  })

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
  })

  describe('execFullResponse / exec', () => {
    let req: TransactWriteRequest
    let transactWriteItemsSpy: jasmine.Spy

    beforeEach(() => {
      req = new TransactWriteRequest()

      transactWriteItemsSpy = jasmine.createSpy().and.returnValue(Promise.resolve({ myResponse: true }))
      Object.assign(req, { dynamoDBWrapper: { transactWriteItems: transactWriteItemsSpy } })

      req.transact(new TransactDelete(SimpleWithPartitionKeyModel, 'myId'))
    })

    it('execFullResponse should call dynamoDBWrapper.transactWriteItems with the params and return the response', async () => {
      const response = await req.execFullResponse()
      expect(transactWriteItemsSpy).toHaveBeenCalledTimes(1)
      expect(transactWriteItemsSpy.calls.mostRecent().args[0]).toEqual(req.params)
      expect(response).toEqual({ myResponse: true })
    })

    it('exec should call dynamoDBWrapper.transactWriteItems with the params and return void', async () => {
      const response = await req.exec()
      expect(transactWriteItemsSpy).toHaveBeenCalledTimes(1)
      expect(transactWriteItemsSpy.calls.mostRecent().args[0]).toEqual(req.params)
      expect(response).toBeUndefined()
    })
  })
})
