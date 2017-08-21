import { QueryInput, QueryOutput } from 'aws-sdk/clients/dynamodb'
import { Observable } from 'rxjs/Observable'
import * as winston from 'winston'
import { ComplexModel } from '../../../test/models/complex.model'
import { DynamoRx } from '../../dynamo/dynamo-rx'
import { QueryRequest } from './query-request'

const DYNAMO_RX_MOCK = {
  query(params: QueryInput): Observable<QueryOutput> {
    winston.debug('params', params)
    return Observable.of({})
  },
}

describe('query request', () => {
  describe('defines correct params', () => {
    let request: QueryRequest<ComplexModel>

    beforeEach(() => {
      request = new QueryRequest(<any>null, ComplexModel)
    })

    it('defaults should be defined', () => {
      expect(request.params.TableName).toBe('complex_model')
      expect(request.params.Limit).toBe(QueryRequest.DEFAULT_LIMIT)
      expect(request.params.IndexName).toBeUndefined()
      expect(request.params.KeyConditions).toBeUndefined()
      expect(request.params.KeyConditionExpression).toBeUndefined()
      expect(request.params.ConditionalOperator).toBeUndefined()
      expect(request.params.AttributesToGet).toBeUndefined()
      expect(request.params.ConsistentRead).toBeUndefined()
      expect(request.params.ExclusiveStartKey).toBeUndefined()
      expect(request.params.ExpressionAttributeNames).toBeUndefined()
      expect(request.params.ExpressionAttributeValues).toBeUndefined()
    })

    it('Limit', () => {
      request.limit(5)
      expect(request.params).toBeDefined()
      expect(request.params.Limit).toBe(5)
    })
  })

  describe('calls endpoint with correct params', () => {
    const dynamoRx: DynamoRx = DYNAMO_RX_MOCK as DynamoRx
    let querySpy

    let request: QueryRequest<ComplexModel>

    beforeEach(() => {
      request = new QueryRequest(<any>null, ComplexModel)
      querySpy = spyOn(dynamoRx, 'query').and.callThrough()
    })

    it('partition key', () => {
      request.wherePartitionKey('partitionKeyValue')
      expect(request.params).toBeDefined()
      expect(request.params.KeyConditionExpression).toBe('bla')
    })
  })
})
