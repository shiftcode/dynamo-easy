import { PutItemInput } from 'aws-sdk/clients/dynamodb'
import { getTableName } from '../../../../test/helper/get-table-name.function'
import { SimpleWithIdModel } from '../../../../test/models/simple-with-id.model'
import { PutRequest } from './put.request'

describe('put request', () => {
  describe('if exists condition', () => {
    it('simple', () => {
      const item: SimpleWithIdModel = { id: 'myId', age: 45 }
      const request = new PutRequest(null, SimpleWithIdModel, getTableName(SimpleWithIdModel), item)
      request.ifNotExists()

      expect((<PutItemInput>request.params).ConditionExpression).toBe('attribute_not_exists (#id)')
      expect((<PutItemInput>request.params).ExpressionAttributeNames).toEqual({ '#id': 'id' })
      expect((<PutItemInput>request.params).ExpressionAttributeValues).toBeUndefined()
    })

    it('predicate', () => {
      const item: SimpleWithIdModel = { id: 'myId', age: 45 }
      const request = new PutRequest(null, SimpleWithIdModel, getTableName(SimpleWithIdModel), item)
      request.ifNotExists(25 + 20 === 40)

      expect((<PutItemInput>request.params).ConditionExpression).toBeUndefined()
      expect((<PutItemInput>request.params).ExpressionAttributeNames).toBeUndefined()
      expect((<PutItemInput>request.params).ExpressionAttributeValues).toBeUndefined()
    })
  })
})
