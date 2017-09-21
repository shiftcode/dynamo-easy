import { SimpleWithIdModel } from '../../../../test/models/simple-with-id.model'
import { GetRequest } from './get.request'

describe('get requst', () => {
  it('projection expression', () => {
    const r = new GetRequest(null, SimpleWithIdModel, 'partitionKeyValue')
    r.projectionExpression('name')

    const params = r.params
    expect(params.ProjectionExpression).toBe('#name')
    expect(params.ExpressionAttributeNames).toEqual({ '#name': 'name' })
  })
})
