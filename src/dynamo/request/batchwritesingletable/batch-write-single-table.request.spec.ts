import * as DynamoDB from '@aws-sdk/client-dynamodb'
import { Organization } from '../../../../test/models'
import { getTableName } from '../../get-table-name.function'
import { BatchWriteSingleTableRequest } from './batch-write-single-table.request'

describe('batch write single table request', () => {
  const tableName = getTableName(Organization)
  const item: Organization = <Organization>{
    id: 'myId',
    createdAtDate: new Date(),
    name: 'myOrg',
  }

  let client: DynamoDB.DynamoDBClient
  let request: BatchWriteSingleTableRequest<Organization>

  describe('constructor', () => {
    it('should throw when no class was given', () => {
      expect(() => new BatchWriteSingleTableRequest(<any>null, <any>null)).toThrow()
    })
    it('should throw when class given is not @Model decorated', () => {
      class NoModel {}
      expect(() => new BatchWriteSingleTableRequest(<any>null, NoModel)).toThrow()
    })

    it('should initialize params', () => {
      request = new BatchWriteSingleTableRequest(<any>null, Organization)
      expect(request.params).toEqual({
        RequestItems: {
          [tableName]: [],
        },
      })
    })
  })

  describe('correct params', () => {
    beforeEach(() => {
      request = new BatchWriteSingleTableRequest(client, Organization)
    })

    it('returnConsumedCapacity', () => {
      request.returnConsumedCapacity(DynamoDB.ReturnConsumedCapacity.TOTAL)
      expect(request.params.ReturnConsumedCapacity).toBe('TOTAL')
    })

    it('returnItemCollectionMetrics', () => {
      request.returnItemCollectionMetrics(DynamoDB.ReturnItemCollectionMetrics.SIZE)
      expect(request.params.ReturnItemCollectionMetrics).toBe('SIZE')
    })

    it('delete with composite key', () => {
      request.delete([item])

      expect(request.params).toEqual({
        RequestItems: {
          [tableName]: [
            {
              DeleteRequest: {
                Key: {
                  id: { S: 'myId' },
                  createdAtDate: { S: item.createdAtDate.toISOString() },
                },
              },
            },
          ],
        },
      })
    })

    it('put object', async () => {
      request.put([item])

      expect(request.params).toEqual({
        RequestItems: {
          [tableName]: [
            {
              PutRequest: {
                Item: {
                  id: { S: 'myId' },
                  createdAtDate: { S: item.createdAtDate.toISOString() },
                  name: { S: 'myOrg' },
                },
              },
            },
          ],
        },
      })
    })

    it('adding >25 items in first delete call throws', () => {
      const twentyFiveItems = new Array(30).map(() => item)
      expect(() => request.delete(twentyFiveItems)).toThrow()
    })

    it('adding >25 items in second delete call throws', () => {
      const twentyFiveItems = new Array(25).map(() => item)
      request.delete(twentyFiveItems)
      expect(() => request.delete(twentyFiveItems)).toThrow()
    })

    it('adding >25 items in first put call throws', () => {
      const twentyFiveItems = new Array(30).map(() => item)
      expect(() => request.put(twentyFiveItems)).toThrow()
    })

    it('adding >25 items in second put call throws', () => {
      const twentyFiveItems = new Array(25).map(() => item)
      request.put(twentyFiveItems)
      expect(() => request.put(twentyFiveItems)).toThrow()
    })
  })

  describe('Unprocessed items', () => {
    const output: DynamoDB.BatchWriteItemCommandOutput = {
      $metadata: {},
      UnprocessedItems: {
        [tableName]: [
          {
            PutRequest: {
              Item: {
                id: { S: 'myId' },
                createdAtDate: { S: item.createdAtDate.toISOString() },
                name: { S: 'myOrg' },
              },
            },
          },
        ],
      },
    }

    let generatorMock: jest.Mock
    let nextFnMock: jest.Mock
    let batchWriteItemMock: jest.Mock

    beforeEach(() => {
      batchWriteItemMock = jest
        .fn()
        .mockReturnValueOnce(Promise.resolve(output))
        .mockReturnValueOnce(Promise.resolve(output))
        .mockReturnValueOnce(Promise.resolve({ MyResult: true }))
      nextFnMock = jest.fn().mockReturnValue({ value: 0 })
      client = <DynamoDB.DynamoDBClient>(<unknown>{ send: batchWriteItemMock })
      generatorMock = jest.fn().mockReturnValueOnce({ next: nextFnMock })

      request = new BatchWriteSingleTableRequest(client, Organization)
    })

    it('should retry when unprocessed items are returned', async () => {
      request.put([item])
      await request.exec(<any>generatorMock)

      // only one instance of the generator should be created
      expect(generatorMock).toHaveBeenCalledTimes(1)

      expect(nextFnMock).toHaveBeenCalledTimes(2)

      expect(batchWriteItemMock).toHaveBeenCalledTimes(3)
    })

    it('should keep other params in additional calls', async () => {
      request.put([item])
      request.returnConsumedCapacity(DynamoDB.ReturnConsumedCapacity.TOTAL)
      request.returnItemCollectionMetrics(DynamoDB.ReturnItemCollectionMetrics.SIZE)
      await request.exec(<any>generatorMock)

      expect(batchWriteItemMock).toHaveBeenCalledTimes(3)
      const paramsThirdCall = <DynamoDB.BatchWriteItemInput>batchWriteItemMock.mock.calls[2][0].input

      expect(paramsThirdCall).toMatchObject(
        expect.objectContaining({ ReturnConsumedCapacity: 'TOTAL', ReturnItemCollectionMetrics: 'SIZE' }),
      )
      // expect(paramsThirdCall.ReturnConsumedCapacity).toBe('TOTAL')
      // expect(paramsThirdCall.ReturnItemCollectionMetrics).toBe('SIZE')
    })
  })

  describe('exec / execFullResponse', () => {
    beforeEach(() => {
      client = <DynamoDB.DynamoDBClient>(<unknown>{ send: () => Promise.resolve({ myResponse: true }) })
      request = new BatchWriteSingleTableRequest(client, Organization)
      request.delete([item])
    })

    it('exec should return nothing', async () => {
      const response = await request.exec()
      expect(response).toBeUndefined()
    })

    it('execFullResponse should return BatchWriteItemOutput', async () => {
      const response = await request.execFullResponse()
      expect(response).toEqual({ myResponse: true })
    })
  })
})
