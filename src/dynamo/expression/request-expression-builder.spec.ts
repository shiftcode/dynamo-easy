import * as DynamoDB from '@aws-sdk/client-dynamodb'
import { ComplexModel, Organization } from '../../../test/models'
import { Metadata } from '../../decorator/metadata/metadata'
import { metadataForModel } from '../../decorator/metadata/metadata-for-model.function'
import { DynamoDbWrapper } from '../dynamo-db-wrapper'
import { QueryRequest } from '../request/query/query.request'
import {
  addCondition,
  addPartitionKeyCondition,
  addSortKeyCondition,
  updateDefinitionFunction,
} from './request-expression-builder'

const DYNAMO_RX_MOCK: DynamoDbWrapper = <DynamoDbWrapper>{
  query(_params: DynamoDB.QueryInput): Promise<DynamoDB.QueryOutput> {
    return Promise.resolve({})
  },
}
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

describe('updateDefinitionFunction', () => {
  let metadata: Metadata<ComplexModel>
  let aDate: Date
  beforeEach(() => {
    metadata = metadataForModel(ComplexModel)
    aDate = new Date()
  })

  it('set property', () => {
    const expr = updateDefinitionFunction('nestedObj').set({ id: 'ok' })([], metadata)

    expect(expr.statement).toBe('#nestedObj = :nestedObj')
    expect(expr.attributeNames).toEqual({ '#nestedObj': 'my_nested_object' })
    expect(expr.attributeValues).toEqual({ ':nestedObj': { M: { id: { S: 'ok' } } } })
    expect(expr.type).toBe('SET')
  })

  it('set nested property', () => {
    const expr = updateDefinitionFunction('nestedObj.id').set('ok')([], metadata)

    expect(expr.statement).toBe('#nestedObj.#id = :nestedObj__id')
    expect(expr.attributeNames).toEqual({ '#nestedObj': 'my_nested_object', '#id': 'id' })
    expect(expr.attributeValues).toEqual({ ':nestedObj__id': { S: 'ok' } })
    expect(expr.type).toBe('SET')
  })

  it('set list item at position', () => {
    const expr = updateDefinitionFunction('sortedComplexSet[0]').set({ id: 'ok' })([], metadata)

    expect(expr.statement).toBe('#sortedComplexSet[0] = :sortedComplexSet_at_0')
    expect(expr.attributeNames).toEqual({ '#sortedComplexSet': 'sortedComplexSet' })
    expect(expr.attributeValues).toEqual({ ':sortedComplexSet_at_0': { M: { id: { S: 'ok' } } } })
    expect(expr.type).toBe('SET')
  })

  it('set nested property of list item at position', () => {
    const expr = updateDefinitionFunction('sortedComplexSet[1].id').set('ok')([], metadata)

    expect(expr.statement).toBe('#sortedComplexSet[1].#id = :sortedComplexSet_at_1__id')
    expect(expr.attributeNames).toEqual({ '#sortedComplexSet': 'sortedComplexSet', '#id': 'id' })
    expect(expr.attributeValues).toEqual({ ':sortedComplexSet_at_1__id': { S: 'ok' } })
    expect(expr.type).toBe('SET')
  })

  it('set nested property of list item with decorators', () => {
    const expr = updateDefinitionFunction('sortedComplexSet[1].date').set(aDate)([], metadata)

    expect(expr.statement).toBe('#sortedComplexSet[1].#date = :sortedComplexSet_at_1__date')
    expect(expr.attributeNames).toEqual({ '#sortedComplexSet': 'sortedComplexSet', '#date': 'my_date' })
    expect(expr.attributeValues).toEqual({ ':sortedComplexSet_at_1__date': { S: aDate.toISOString() } })
    expect(expr.type).toBe('SET')
  })
})
