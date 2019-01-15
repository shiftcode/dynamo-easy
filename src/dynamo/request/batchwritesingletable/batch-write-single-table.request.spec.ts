// tslint:disable:no-unnecessary-class

import * as DynamoDB from 'aws-sdk/clients/dynamodb'
import { Organization } from '../../../../test/models'
import { DynamoDbWrapper } from '../../dynamo-db-wrapper'
import { getTableName } from '../../get-table-name.function'
import { BatchWriteSingleTableRequest } from './batch-write-single-table.request'

describe('batch write single table request', () => {
  const tableName = getTableName(Organization)
  const item: Organization = <Organization>{
    id: 'myId',
    createdAtDate: new Date(),
    name: 'myOrg',
  }

  let dynamoDBWrapper: DynamoDbWrapper
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
      request = new BatchWriteSingleTableRequest(dynamoDBWrapper, Organization)
    })

    it('returnConsumedCapacity', () => {
      request.returnConsumedCapacity('TOTAL')
      expect(request.params.ReturnConsumedCapacity).toBe('TOTAL')
    })

    it('returnItemCollectionMetrics', () => {
      request.returnItemCollectionMetrics('SIZE')
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
    const output: DynamoDB.BatchWriteItemOutput = {
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

    let generatorSpy: jasmine.Spy
    let nextFnSpy: jasmine.Spy
    let batchWriteItemSpy: jasmine.Spy

    beforeEach(() => {
      batchWriteItemSpy = jasmine
        .createSpy()
        .and.returnValues(Promise.resolve(output), Promise.resolve(output), Promise.resolve({ MyResult: true }))
      nextFnSpy = jasmine.createSpy().and.returnValue({ value: 0 })
      dynamoDBWrapper = <DynamoDbWrapper>(<any>{ batchWriteItem: batchWriteItemSpy })
      generatorSpy = jasmine.createSpy().and.returnValue({ next: nextFnSpy })

      request = new BatchWriteSingleTableRequest(dynamoDBWrapper, Organization)
    })

    it('should retry when unprocessed items are returned', async () => {
      request.put([item])
      await request.exec(<any>generatorSpy)

      // only one instance of the generator should be created
      expect(generatorSpy).toHaveBeenCalledTimes(1)

      expect(nextFnSpy).toHaveBeenCalledTimes(2)

      expect(batchWriteItemSpy).toHaveBeenCalledTimes(3)
    })

    it('should keep other params in additional calls', async () => {
      request.put([item])
      request.returnConsumedCapacity('TOTAL')
      request.returnItemCollectionMetrics('SIZE')
      await request.exec(<any>generatorSpy)

      expect(batchWriteItemSpy).toHaveBeenCalledTimes(3)
      const paramsThirdCall = <DynamoDB.BatchWriteItemInput>batchWriteItemSpy.calls.all()[2].args[0]

      expect(paramsThirdCall).toBeDefined()
      expect(paramsThirdCall.ReturnConsumedCapacity).toBe('TOTAL')
      expect(paramsThirdCall.ReturnItemCollectionMetrics).toBe('SIZE')
    })
  })

  describe('exec / execFullResponse', () => {
    beforeEach(() => {
      dynamoDBWrapper = <DynamoDbWrapper>(<any>{ batchWriteItem: () => Promise.resolve({ myResponse: true }) })
      request = new BatchWriteSingleTableRequest(dynamoDBWrapper, Organization)
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
