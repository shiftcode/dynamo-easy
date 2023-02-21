import * as DynamoDB from '@aws-sdk/client-dynamodb'
import { SimpleWithPartitionKeyModel } from '../../test/models'
import { DynamoDbWrapper } from '../dynamo/dynamo-db-wrapper'
import { QueryRequest } from '../dynamo/request/query/query.request'
import { ScanRequest } from '../dynamo/request/scan/scan.request'
import { fetchAll } from './fetch-all.function'

describe('fetch all', () => {
  let dynamoDBWrapper: DynamoDbWrapper
  let methodMock: jest.Mock
  let result: SimpleWithPartitionKeyModel[]

  const output1: DynamoDB.ScanOutput | DynamoDB.QueryOutput = {
    Items: [{ id: { S: 'id-1' }, age: { N: '21' } }],
    Count: 1,
    LastEvaluatedKey: { id: { S: 'id-1' } },
  }
  const output2: DynamoDB.ScanOutput | DynamoDB.QueryOutput = {
    Items: [{ id: { S: 'id-2' }, age: { N: '22' } }],
    Count: 1,
  }

  describe('scan request', () => {
    let req: ScanRequest<SimpleWithPartitionKeyModel>

    beforeEach(async () => {
      dynamoDBWrapper = new DynamoDbWrapper(new DynamoDB.DynamoDB({}))
      jest
        .spyOn(dynamoDBWrapper, 'scan')
        .mockReturnValueOnce(Promise.resolve(output1))
        .mockReturnValueOnce(Promise.resolve(output2))
      methodMock = <jest.Mock>dynamoDBWrapper.scan
      req = new ScanRequest(dynamoDBWrapper, SimpleWithPartitionKeyModel)
      result = await fetchAll(req)
    })

    it('should scan until LastEvaluatedKey is undefined', async () => {
      expect(methodMock).toHaveBeenCalledTimes(2)
    })

    it('should use LastEvaluatedKey for next request', async () => {
      expect(methodMock).toHaveBeenLastCalledWith(
        expect.objectContaining(<DynamoDB.ScanInput>{ ExclusiveStartKey: output1.LastEvaluatedKey }),
      )
    })

    it('should concatenate the result items', async () => {
      expect(result).toBeDefined()
      expect(result.length).toBe(2)
      expect(result[0]).toEqual({ id: 'id-1', age: 21 })
      expect(result[1]).toEqual({ id: 'id-2', age: 22 })
    })

    it('should fetch without limit per request', () => {
      expect(req.params.Limit).toBeUndefined()
    })
  })

  describe('query request', () => {
    let req: QueryRequest<SimpleWithPartitionKeyModel>

    beforeEach(async () => {
      dynamoDBWrapper = new DynamoDbWrapper(new DynamoDB.DynamoDB({}))
      jest
        .spyOn(dynamoDBWrapper, 'query')
        .mockReturnValueOnce(Promise.resolve(output1))
        .mockReturnValueOnce(Promise.resolve(output2))
      methodMock = <jest.Mock>dynamoDBWrapper.query
      req = new QueryRequest(dynamoDBWrapper, SimpleWithPartitionKeyModel)
      req.wherePartitionKey('id-0')
      result = await fetchAll(req)
    })

    it('should query until LastEvaluatedKey is undefined', async () => {
      expect(methodMock).toHaveBeenCalledTimes(2)
    })

    it('should use LastEvaluatedKey for next request', async () => {
      expect(methodMock).toHaveBeenLastCalledWith(
        expect.objectContaining(<DynamoDB.QueryInput>{ ExclusiveStartKey: output1.LastEvaluatedKey }),
      )
    })

    it('should concatenate the result items', async () => {
      expect(result).toBeDefined()
      expect(result.length).toBe(2)
      expect(result[0]).toEqual({ id: 'id-1', age: 21 })
      expect(result[1]).toEqual({ id: 'id-2', age: 22 })
    })

    it('should fetch without limit per request', () => {
      expect(req.params.Limit).toBeUndefined()
    })
  })
})
