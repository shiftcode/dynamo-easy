import { GetItemInput } from 'aws-sdk/clients/dynamodb'
import { getTableName } from '../../../../test/helper/get-table-name.function'
import { SimpleWithPartitionKeyModel } from '../../../../test/models/simple-with-partition-key.model'
import { GetRequest } from './get.request'

describe('get requst', () => {
  let request: GetRequest<SimpleWithPartitionKeyModel>

  beforeEach(() => {
    request = new GetRequest(
      <any>null,
      SimpleWithPartitionKeyModel,
      getTableName(SimpleWithPartitionKeyModel),
      'partitionKeyValue'
    )
  })

  it('default params', () => {
    const params: GetItemInput = request.params
    expect(params.TableName).toBe('simple-with-partition-key-models')
    expect(params.Key).toEqual({ id: { S: 'partitionKeyValue' } })
    expect(Object.keys(params).length).toBe(2)
  })

  it('projection expression', () => {
    request.projectionExpression('name')

    const params = request.params
    expect(params.ProjectionExpression).toBe('#name')
    expect(params.ExpressionAttributeNames).toEqual({ '#name': 'name' })
    expect(Object.keys(params).length).toBe(4)
  })
})
