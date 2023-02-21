import * as DynamoDB from '@aws-sdk/client-dynamodb'
import { ComplexModel, SimpleWithPartitionKeyModel } from '../../../../test/models'
import { metadataForModel } from '../../../decorator/metadata/metadata-for-model.function'
import { addProjectionExpressionParam } from './add-projection-expression-param.function'

describe('add projection expression param function', () => {
  let params: DynamoDB.KeysAndAttributes

  beforeEach(() => {
    params = <DynamoDB.KeysAndAttributes>{}
  })

  it('add single projection attribute to params', () => {
    addProjectionExpressionParam<SimpleWithPartitionKeyModel>(['age'], params)
    expect(params.ProjectionExpression).toBeDefined()
    expect(params.ProjectionExpression).toBe('#age')
    expect(params.ExpressionAttributeNames).toEqual({ '#age': 'age' })
  })

  it('add multiple projection attribute to params', () => {
    addProjectionExpressionParam<SimpleWithPartitionKeyModel>(['age', 'id'], params)
    expect(params.ProjectionExpression).toBeDefined()
    expect(params.ProjectionExpression).toBe('#age, #id')
    expect(params.ExpressionAttributeNames).toEqual({ '#age': 'age', '#id': 'id' })
  })

  it('add multiple projection attribute respecting given metadata to params', () => {
    addProjectionExpressionParam<ComplexModel>(['active', 'simpleProperty'], params, metadataForModel(ComplexModel))
    expect(params.ProjectionExpression).toBeDefined()
    expect(params.ProjectionExpression).toBe('#active, #simpleProperty')
    expect(params.ExpressionAttributeNames).toEqual({ '#active': 'isActive', '#simpleProperty': 'simpleProperty' })
  })
})
