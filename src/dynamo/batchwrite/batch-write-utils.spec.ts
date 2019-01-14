import * as DynamoDB from 'aws-sdk/clients/dynamodb'
import { DynamoRx } from '../dynamo-rx'
import { batchWriteItemsWriteAll, hasUnprocessedItems } from './batch-write-utils'

describe('batch-write-utils', () => {
  describe('batchWriteItemsWriteAll', () => {
    let batchWriteItemSpy: jasmine.Spy
    let dynamoRx: DynamoRx
    let backoffTimerMock: { next: jasmine.Spy }

    const output1: DynamoDB.BatchWriteItemOutput = {
      UnprocessedItems: {
        tableA: [
          {
            PutRequest: { Item: { id: { S: 'id-A' } } },
          },
        ],
      },
    }
    const output2: DynamoDB.BatchWriteItemOutput = {}

    beforeEach(async () => {
      batchWriteItemSpy = jasmine.createSpy().and.returnValues(Promise.resolve(output1), Promise.resolve(output2))
      dynamoRx = <any>{ batchWriteItem: batchWriteItemSpy }
      backoffTimerMock = { next: jasmine.createSpy().and.returnValue({ value: 0 }) }

      await batchWriteItemsWriteAll(dynamoRx, <any>{}, <IterableIterator<number>>(<any>backoffTimerMock), 0)
    })

    it('should use UnprocessedKeys for next request', () => {
      expect(batchWriteItemSpy).toHaveBeenCalledTimes(2)
      expect(batchWriteItemSpy.calls.mostRecent().args[0]).toBeDefined()
      expect(batchWriteItemSpy.calls.mostRecent().args[0].RequestItems).toBeDefined()
      expect(batchWriteItemSpy.calls.mostRecent().args[0].RequestItems).toEqual(output1.UnprocessedItems)
    })

    it('should backoff when UnprocessedItems', () => {
      expect(backoffTimerMock.next).toHaveBeenCalledTimes(1)
    })
  })

  describe('hasUnprocessedItems', () => {
    it('should return false when no items', () => {
      expect(hasUnprocessedItems({})).toBe(false)
      expect(hasUnprocessedItems({ UnprocessedItems: {} })).toBe(false)
      expect(hasUnprocessedItems({ UnprocessedItems: { myTable: [] } })).toBe(false)
    })

    it('should return true when items', () => {
      expect(hasUnprocessedItems({ UnprocessedItems: { myTable: [{ PutRequest: { Item: { id: { S: 'myId' } } } }] } }))
    })
  })
})
