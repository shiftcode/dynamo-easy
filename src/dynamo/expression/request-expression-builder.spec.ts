import { getTableName } from '../../../test/helper'
import { Organization } from '../../../test/models'
import { QueryRequest } from '../request'
import { DYNAMO_RX_MOCK } from '../request/query/query.request.spec'
import { RequestExpressionBuilder } from './request-expression-builder'

describe('request expression builder', () => {
  describe('adds condition expression to request', () => {
    it('partition key', () => {
      const queryRequest = new QueryRequest(DYNAMO_RX_MOCK, Organization, getTableName(Organization))
      RequestExpressionBuilder.addPartitionKeyCondition('id', 'idValue', queryRequest)

      const params = queryRequest.params
      expect(params.KeyConditionExpression).toBe('#id = :id')
      expect(params.ExpressionAttributeNames).toEqual({ '#id': 'id' })
      expect(params.ExpressionAttributeValues).toEqual({ ':id': { S: 'idValue' } })
    })

    it('sort key', () => {
      const queryRequest = new QueryRequest(DYNAMO_RX_MOCK, Organization, getTableName(Organization))
      RequestExpressionBuilder.addSortKeyCondition('count', queryRequest).equals(25)

      const params = queryRequest.params
      expect(params.KeyConditionExpression).toBe('#count = :count')
      expect(params.ExpressionAttributeNames).toEqual({ '#count': 'count' })
      expect(params.ExpressionAttributeValues).toEqual({ ':count': { N: '25' } })
    })

    it('non key', () => {
      const queryRequest = new QueryRequest(DYNAMO_RX_MOCK, Organization, getTableName(Organization))
      RequestExpressionBuilder.addCondition('FilterExpression', 'age', queryRequest).lte(45)

      const params = queryRequest.params
      expect(params.FilterExpression).toBe('#age <= :age')
      expect(params.ExpressionAttributeNames).toEqual({ '#age': 'age' })
      expect(params.ExpressionAttributeValues).toEqual({ ':age': { N: '45' } })
    })
  })
})
