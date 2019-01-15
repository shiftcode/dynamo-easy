import * as DynamoDB from 'aws-sdk/clients/dynamodb'
import { Organization } from '../../../test/models'
import { DynamoDbWrapper } from '../dynamo-db-wrapper'
import { QueryRequest } from '../request'
import { addCondition, addPartitionKeyCondition, addSortKeyCondition } from './request-expression-builder'

const DYNAMO_RX_MOCK: DynamoDbWrapper = <DynamoDbWrapper>{
  query(params: DynamoDB.QueryInput): Promise<DynamoDB.QueryOutput> {
    return Promise.resolve({})
  },
}

describe('request expression builder', () => {
  describe('adds condition expression to request', () => {
    it('partition key', () => {
      const queryRequest = new QueryRequest(DYNAMO_RX_MOCK, Organization)
      addPartitionKeyCondition('id', 'idValue', queryRequest)

      const params = queryRequest.params
      expect(params.KeyConditionExpression).toBe('#id = :id')
      expect(params.ExpressionAttributeNames).toEqual({ '#id': 'id' })
      expect(params.ExpressionAttributeValues).toEqual({ ':id': { S: 'idValue' } })
    })

    it('sort key', () => {
      const queryRequest = new QueryRequest(DYNAMO_RX_MOCK, Organization)
      addSortKeyCondition('count', queryRequest).equals(25)

      const params = queryRequest.params
      expect(params.KeyConditionExpression).toBe('#count = :count')
      expect(params.ExpressionAttributeNames).toEqual({ '#count': 'count' })
      expect(params.ExpressionAttributeValues).toEqual({ ':count': { N: '25' } })
    })

    it('non key', () => {
      const queryRequest = new QueryRequest(DYNAMO_RX_MOCK, Organization)
      addCondition<any, Organization, 'count'>('FilterExpression', 'count', queryRequest).lte(45)

      const params = queryRequest.params
      expect(params.FilterExpression).toBe('#count <= :count')
      expect(params.ExpressionAttributeNames).toEqual({ '#count': 'count' })
      expect(params.ExpressionAttributeValues).toEqual({ ':count': { N: '45' } })
    })
  })
})
