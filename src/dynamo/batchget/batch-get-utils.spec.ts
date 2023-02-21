import * as DynamoDB from '@aws-sdk/client-dynamodb'
import { DynamoDbWrapper } from '../dynamo-db-wrapper'
import { batchGetItemsFetchAll, combineBatchGetResponses, hasUnprocessedKeys } from './batch-get-utils'

describe('batch-get utils', () => {
  describe('hasUnprocessedKeys', () => {
    it('should return bool according to given object', () => {
      expect(hasUnprocessedKeys({})).toBeFalsy()
      expect(hasUnprocessedKeys({ Responses: {} })).toBeFalsy()
      expect(hasUnprocessedKeys({ UnprocessedKeys: {} })).toBeFalsy()
      expect(hasUnprocessedKeys({ UnprocessedKeys: { aTableName: { Keys: [] } } })).toBeFalsy()
      expect(hasUnprocessedKeys({ UnprocessedKeys: { aTableName: { Keys: [{ id: { S: 'id' } }] } } })).toBeTruthy()
    })
  })

  describe('combineBatchGetResponses', () => {
    const resp1: DynamoDB.BatchGetItemOutput = {
      Responses: {
        tableA: [{ id: { S: 'id-a1' } }],
        tableB: [{ id: { S: 'id-b' } }],
      },
      UnprocessedKeys: {
        'tableA:': { Keys: [{ id: { S: 'id-a2' } }] },
        'tableC:': { Keys: [{ id: { S: 'id-c' } }] },
        'tableD:': { Keys: [{ id: { S: 'id-d' } }] },
      },
    }
    const resp2: DynamoDB.BatchGetItemOutput = {
      Responses: {
        tableA: [{ id: { S: 'id-a2' } }],
        tableC: [{ id: { S: 'id-c' } }],
      },
      UnprocessedKeys: {
        'tableD:': { Keys: [{ id: { S: 'id-d' } }] },
      },
    }
    const expectedOutput: DynamoDB.BatchGetItemOutput = {
      Responses: {
        tableA: [{ id: { S: 'id-a1' } }, { id: { S: 'id-a2' } }],
        tableB: [{ id: { S: 'id-b' } }],
        tableC: [{ id: { S: 'id-c' } }],
      },
      UnprocessedKeys: {
        'tableD:': { Keys: [{ id: { S: 'id-d' } }] },
      },
    }
    it('should combine correctly', () => {
      expect(combineBatchGetResponses(resp1)(resp2)).toEqual(expectedOutput)
    })
  })

  describe('batchGetItemsFetchAll', () => {
    let batchGetItemsMock: jest.Mock
    let dynamoDBWrapper: DynamoDbWrapper
    let backoffTimerMock: { next: jest.Mock }

    const output1: DynamoDB.BatchGetItemOutput = {
      Responses: {
        tableA: [{ id: { S: 'id-A' } }],
      },
      UnprocessedKeys: {
        tableA: {
          Keys: [{ id: { S: 'id-A' } }],
        },
      },
    }
    const output2: DynamoDB.BatchGetItemOutput = {
      Responses: {
        tableA: [{ id: { S: 'id-A' } }],
      },
    }

    beforeEach(async () => {
      batchGetItemsMock = jest
        .fn()
        .mockReturnValueOnce(Promise.resolve(output1))
        .mockReturnValueOnce(Promise.resolve(output2))
      dynamoDBWrapper = <any>{ batchGetItems: batchGetItemsMock }
      backoffTimerMock = { next: jest.fn().mockReturnValueOnce({ value: 0 }) }

      await batchGetItemsFetchAll(dynamoDBWrapper, <any>{}, <IterableIterator<number>>(<any>backoffTimerMock), 0)
    })

    it('should use UnprocessedKeys for next request', () => {
      expect(batchGetItemsMock).toHaveBeenCalledTimes(2)
      expect(batchGetItemsMock).toHaveBeenLastCalledWith(
        expect.objectContaining({ RequestItems: output1.UnprocessedKeys }),
      )
    })

    it('should backoff when UnprocessedItems', () => {
      expect(backoffTimerMock.next).toHaveBeenCalledTimes(1)
    })
  })
})
