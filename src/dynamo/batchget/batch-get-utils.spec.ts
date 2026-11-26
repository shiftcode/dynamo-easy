import * as DynamoDB from '@aws-sdk/client-dynamodb'
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

  describe('batchGetItemsFetchAll limits', () => {
    const unprocessed: DynamoDB.BatchGetItemCommandOutput = {
      $metadata: {},
      UnprocessedKeys: { tableA: { Keys: [{ id: { S: 'id-A' } }] } },
    }
    const timer = () => <IterableIterator<number>>(<any>{ next: () => ({ value: 1000 }) })

    it('should reject after maxRetries follow-up requests', async () => {
      const sendMock = jest.fn().mockResolvedValue(unprocessed)
      await expect(batchGetItemsFetchAll(<any>{ send: sendMock }, <any>{}, timer(), 0, 0, 2)).rejects.toThrow(
        'max retries',
      )
      expect(sendMock).toHaveBeenCalledTimes(3)
    })

    it('should cap the delay at maxDelay', async () => {
      const setTimeoutSpy = jest.spyOn(global, 'setTimeout')
      const sendMock = jest.fn().mockResolvedValueOnce(unprocessed).mockResolvedValueOnce({ $metadata: {} })
      await batchGetItemsFetchAll(<any>{ send: sendMock }, <any>{}, timer(), 1000, 5)
      expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 5)
      expect(sendMock).toHaveBeenCalledTimes(2)
      setTimeoutSpy.mockRestore()
    })
  })

  describe('batchGetItemsFetchAll', () => {
    let sendMock: jest.Mock
    let client: DynamoDB.DynamoDBClient
    let backoffTimerMock: { next: jest.Mock }

    const output1: DynamoDB.BatchGetItemCommandOutput = {
      $metadata: {},
      Responses: {
        tableA: [{ id: { S: 'id-A' } }],
      },
      UnprocessedKeys: {
        tableA: {
          Keys: [{ id: { S: 'id-A' } }],
        },
      },
    }
    const output2: DynamoDB.BatchGetItemCommandOutput = {
      $metadata: {},
      Responses: {
        tableA: [{ id: { S: 'id-A' } }],
      },
    }

    beforeEach(async () => {
      sendMock = jest.fn().mockReturnValueOnce(Promise.resolve(output1)).mockReturnValueOnce(Promise.resolve(output2))
      client = <any>{ send: sendMock }
      backoffTimerMock = { next: jest.fn().mockReturnValueOnce({ value: 0 }) }

      await batchGetItemsFetchAll(client, <any>{}, <IterableIterator<number>>(<any>backoffTimerMock), 0)
    })

    it('should use UnprocessedKeys for next request', () => {
      expect(sendMock).toHaveBeenCalledTimes(2)
      expect(sendMock.mock.calls[1][0]).toBeInstanceOf(DynamoDB.BatchGetItemCommand)
      expect(sendMock.mock.calls[1][0].input).toEqual(
        expect.objectContaining({ RequestItems: output1.UnprocessedKeys }),
      )
    })

    it('should backoff when UnprocessedItems', () => {
      expect(backoffTimerMock.next).toHaveBeenCalledTimes(1)
    })
  })
})
