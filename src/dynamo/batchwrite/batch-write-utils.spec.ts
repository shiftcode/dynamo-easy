import * as DynamoDB from 'aws-sdk/clients/dynamodb'
import { DynamoDbWrapper } from '../dynamo-db-wrapper'
import { batchWriteItemsWriteAll, hasUnprocessedItems } from './batch-write-utils'

describe('batch-write-utils', () => {
  describe('batchWriteItemsWriteAll', () => {
    describe('indefinite retries', () => {
      let batchWriteItemSpy: jasmine.Spy
      let dynamoDBWrapper: DynamoDbWrapper
      let backoffTimerMock: { next: jasmine.Spy }

      const unsuccessfulOutput: DynamoDB.BatchWriteItemOutput = {
        UnprocessedItems: {
          tableA: [
            {
              PutRequest: { Item: { id: { S: 'id-A' } } },
            },
          ],
        },
      }
      const successfulOutput: DynamoDB.BatchWriteItemOutput = {
        UnprocessedItems: {},
      }

      beforeEach(async () => {
        batchWriteItemSpy = jasmine
          .createSpy()
          .and.returnValues(
            Promise.resolve(unsuccessfulOutput),
            Promise.resolve(unsuccessfulOutput),
            Promise.resolve(unsuccessfulOutput),
            Promise.resolve(unsuccessfulOutput),
            Promise.resolve(successfulOutput),
          )

        dynamoDBWrapper = <any>{ batchWriteItem: batchWriteItemSpy }
        backoffTimerMock = { next: jasmine.createSpy().and.returnValue({ value: 0 }) }

        await batchWriteItemsWriteAll(dynamoDBWrapper, <any>{}, <IterableIterator<number>>(<any>backoffTimerMock), 0)
      })

      it('should use UnprocessedKeys for next request', () => {
        expect(batchWriteItemSpy).toHaveBeenCalledTimes(5)
        expect(batchWriteItemSpy.calls.mostRecent().args[0]).toBeDefined()
        expect(batchWriteItemSpy.calls.mostRecent().args[0].RequestItems).toBeDefined()
        expect(batchWriteItemSpy.calls.mostRecent().args[0].RequestItems).toEqual(unsuccessfulOutput.UnprocessedItems)
      })

      it('should backoff when UnprocessedItems', () => {
        expect(backoffTimerMock.next).toHaveBeenCalledTimes(4)
      })
    })

    describe('with maxRetries', () => {
      let batchWriteItemSpy: jasmine.Spy
      let dynamoDBWrapper: DynamoDbWrapper
      let backoffTimerMock: { next: jasmine.Spy }
      const maxRetries = 2

      const unsuccessfulOutput: DynamoDB.BatchWriteItemOutput = {
        UnprocessedItems: {
          tableA: [
            {
              PutRequest: { Item: { id: { S: 'id-A' } } },
            },
          ],
        },
      }

      beforeEach(async () => {
        batchWriteItemSpy = jasmine
          .createSpy()
          .and.returnValues(
            Promise.resolve(unsuccessfulOutput),
            Promise.resolve(unsuccessfulOutput),
            Promise.resolve(unsuccessfulOutput),
            Promise.resolve(unsuccessfulOutput),
            Promise.resolve(unsuccessfulOutput),
            Promise.resolve(unsuccessfulOutput),
          )
        dynamoDBWrapper = <any>{ batchWriteItem: batchWriteItemSpy }
        backoffTimerMock = { next: jasmine.createSpy().and.returnValue({ value: 0 }) }

        await batchWriteItemsWriteAll(
          dynamoDBWrapper,
          <any>{},
          <IterableIterator<number>>(<any>backoffTimerMock),
          0,
          maxRetries,
        )
      })

      it('should use UnprocessedKeys for next request', () => {
        expect(batchWriteItemSpy).toHaveBeenCalledTimes(3)
        expect(batchWriteItemSpy.calls.mostRecent().args[0]).toBeDefined()
        expect(batchWriteItemSpy.calls.mostRecent().args[0].RequestItems).toBeDefined()
        expect(batchWriteItemSpy.calls.mostRecent().args[0].RequestItems).toEqual(unsuccessfulOutput.UnprocessedItems)
      })

      it('should backoff when UnprocessedItems', () => {
        expect(backoffTimerMock.next).toHaveBeenCalledTimes(2)
      })
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
