import * as DynamoDB from '@aws-sdk/client-dynamodb'
import { batchWriteItemsWriteAll, hasUnprocessedItems } from './batch-write-utils'

describe('batch-write-utils', () => {
  describe('batchWriteItemsWriteAll', () => {
    let sendMock: jest.Mock
    let client: DynamoDB.DynamoDBClient
    let backoffTimerMock: { next: jest.Mock }

    const output1: DynamoDB.BatchWriteItemCommandOutput = {
      $metadata: {},
      UnprocessedItems: {
        tableA: [
          {
            PutRequest: { Item: { id: { S: 'id-A' } } },
          },
        ],
      },
    }
    const output2: DynamoDB.BatchWriteItemCommandOutput = { $metadata: {} }

    beforeEach(async () => {
      sendMock = jest.fn().mockReturnValueOnce(Promise.resolve(output1)).mockReturnValueOnce(Promise.resolve(output2))
      client = <any>{ send: sendMock }
      backoffTimerMock = { next: jest.fn().mockReturnValueOnce({ value: 0 }) }

      await batchWriteItemsWriteAll(client, <any>{}, <IterableIterator<number>>(<any>backoffTimerMock), 0)
    })

    it('should use UnprocessedKeys for next request', () => {
      expect(sendMock).toHaveBeenCalledTimes(2)
      expect(sendMock.mock.calls[1][0]).toBeInstanceOf(DynamoDB.BatchWriteItemCommand)
      expect(sendMock.mock.calls[1][0].input).toEqual(
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
