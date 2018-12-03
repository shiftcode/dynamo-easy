import { PutItemInput } from 'aws-sdk/clients/dynamodb'
import { SimpleWithCompositePartitionKeyModel, SimpleWithPartitionKeyModel } from '../../../test/models'
import { PutOperation } from './put.operation'

describe('put operation', () => {
  // ok

  describe('constructor', () => {
    it('default params', () => {
      const item: SimpleWithPartitionKeyModel = { id: 'myId', age: 45 }
      const putOp = new PutOperation(SimpleWithPartitionKeyModel, item)
      const params: PutItemInput = putOp.params

      expect(params.TableName).toBe('simple-with-partition-key-models')
      expect(params.Item).toEqual({ id: { S: 'myId' }, age: { N: '45' } })
      expect(Object.keys(params).length).toBe(2)
    })
  })

  describe('if not exists condition', () => {
    it('simple partition key', () => {
      const item: SimpleWithPartitionKeyModel = { id: 'myId', age: 45 }
      const putOp = new PutOperation(SimpleWithPartitionKeyModel, item)
      putOp.ifNotExists()

      const params: PutItemInput = putOp.params
      expect(params.ConditionExpression).toBe('(attribute_not_exists (#id))')
      expect(params.ExpressionAttributeNames).toEqual({ '#id': 'id' })
      expect(params.ExpressionAttributeValues).toBeUndefined()
    })

    it('composite partition key', () => {
      const now = new Date()
      const item: SimpleWithCompositePartitionKeyModel = { id: 'myId', creationDate: now, age: 45 }
      const putOp = new PutOperation(SimpleWithCompositePartitionKeyModel, item)
      putOp.ifNotExists()

      const params: PutItemInput = putOp.params
      expect(params.ConditionExpression).toBe('(attribute_not_exists (#id) AND attribute_not_exists (#creationDate))')
      expect(params.ExpressionAttributeNames).toEqual({ '#id': 'id', '#creationDate': 'creationDate' })
      expect(params.ExpressionAttributeValues).toBeUndefined()
    })

    it('predicate', () => {
      const item: SimpleWithPartitionKeyModel = { id: 'myId', age: 45 }
      const putOp = new PutOperation(SimpleWithPartitionKeyModel, item)
      putOp.ifNotExists(25 + 20 === 40)

      const params: PutItemInput = putOp.params
      expect(params.ConditionExpression).toBeUndefined()
      expect(params.ExpressionAttributeNames).toBeUndefined()
      expect(params.ExpressionAttributeValues).toBeUndefined()
    })
  })
})
