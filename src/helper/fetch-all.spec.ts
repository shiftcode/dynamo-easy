import * as DynamoDB from 'aws-sdk/clients/dynamodb'
import { of } from 'rxjs'
import { SimpleWithPartitionKeyModel } from '../../test/models'
import { DynamoRx, QueryRequest } from '../dynamo'
import { ScanRequest } from '../dynamo/request'
import { fetchAll } from './fetch-all.function'

describe('fetch all', () => {
  let dynamoRx: DynamoRx
  let methodSpy: jasmine.Spy
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
      dynamoRx = new DynamoRx()
      spyOn(dynamoRx, 'scan').and.returnValues(of(output1), of(output2))
      methodSpy = <jasmine.Spy>dynamoRx.scan
      req = new ScanRequest(dynamoRx, SimpleWithPartitionKeyModel)
      result = await fetchAll(req).toPromise()
    })

    it('should scan until LastEvaluatedKey is undefined', async () => {
      expect(methodSpy).toHaveBeenCalledTimes(2)
    })

    it('should use LastEvaluatedKey for next request', async () => {
      expect((<DynamoDB.ScanInput>methodSpy.calls.mostRecent().args[0]).ExclusiveStartKey).toEqual(
        output1.LastEvaluatedKey,
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
      dynamoRx = new DynamoRx()
      spyOn(dynamoRx, 'query').and.returnValues(of(output1), of(output2))
      methodSpy = <jasmine.Spy>dynamoRx.query
      req = new QueryRequest(dynamoRx, SimpleWithPartitionKeyModel)
      req.wherePartitionKey('id-0')
      result = await fetchAll(req).toPromise()
    })

    it('should query until LastEvaluatedKey is undefined', async () => {
      expect(methodSpy).toHaveBeenCalledTimes(2)
    })

    it('should use LastEvaluatedKey for next request', async () => {
      expect((<DynamoDB.QueryInput>methodSpy.calls.mostRecent().args[0]).ExclusiveStartKey).toEqual(
        output1.LastEvaluatedKey,
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
