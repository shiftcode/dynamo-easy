import * as DynamoDB from '@aws-sdk/client-dynamodb'
import { DynamoDbWrapper } from '../dynamo-db-wrapper'
import { batchWriteItemsWriteAll, hasUnprocessedItems } from './batch-write-utils'

describe('batch-write-utils', () => {
  describe('batchWriteItemsWriteAll', () => {
    let batchWriteItemMock: jest.Mock
    let dynamoDBWrapper: DynamoDbWrapper
    let backoffTimerMock: { next: jest.Mock }

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
      batchWriteItemMock = jest
        .fn()
        .mockReturnValueOnce(Promise.resolve(output1))
        .mockReturnValueOnce(Promise.resolve(output2))
      dynamoDBWrapper = <any>{ batchWriteItem: batchWriteItemMock }
      backoffTimerMock = { next: jest.fn().mockReturnValueOnce({ value: 0 }) }

      await batchWriteItemsWriteAll(dynamoDBWrapper, <any>{}, <IterableIterator<number>>(<any>backoffTimerMock), 0)
    })

    it('should use UnprocessedKeys for next request', () => {
      expect(batchWriteItemMock).toHaveBeenCalledTimes(2)
      expect(batchWriteItemMock).toHaveBeenLastCalledWith(
        expect.objectContaining({ RequestItems: output1.UnprocessedItems }),
      )
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
