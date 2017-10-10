import { PutItemInput } from 'aws-sdk/clients/dynamodb'
import { getTableName } from '../../../../test/helper/get-table-name.function'
import { SimpleWithIdModel } from '../../../../test/models/simple-with-id.model'
import { PutRequest } from './put.request'

describe('put request', () => {
  it('default params', () => {
    const item: SimpleWithIdModel = { id: 'myId', age: 45 }
    const request = new PutRequest(null, SimpleWithIdModel, getTableName(SimpleWithIdModel), item)
    const params: PutItemInput = request.params

    expect(params.TableName).toBe('simple-with-id-models')
    expect(params.Item).toEqual({ id: { S: 'myId' }, age: { N: '45' } })
    expect(Object.keys(params).length).toBe(2)
  })

  describe('if exists condition', () => {
    it('simple', () => {
      const item: SimpleWithIdModel = { id: 'myId', age: 45 }
      const request = new PutRequest(null, SimpleWithIdModel, getTableName(SimpleWithIdModel), item)
      request.ifNotExists()

      const params: PutItemInput = request.params
      expect(params.ConditionExpression).toBe('attribute_not_exists (#id)')
      expect(params.ExpressionAttributeNames).toEqual({ '#id': 'id' })
      expect(params.ExpressionAttributeValues).toBeUndefined()
    })

    it('predicate', () => {
      const item: SimpleWithIdModel = { id: 'myId', age: 45 }
      const request = new PutRequest(null, SimpleWithIdModel, getTableName(SimpleWithIdModel), item)
      request.ifNotExists(25 + 20 === 40)

      const params: PutItemInput = request.params
      expect(params.ConditionExpression).toBeUndefined()
      expect(params.ExpressionAttributeNames).toBeUndefined()
      expect(params.ExpressionAttributeValues).toBeUndefined()
    })
  })
})
