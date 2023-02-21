// tslint:disable:max-classes-per-file
// tslint:disable:no-unnecessary-class
import * as DynamoDB from '@aws-sdk/client-dynamodb'
import { ReturnValuesOnConditionCheckFailure } from '@aws-sdk/client-dynamodb'
import { SimpleWithPartitionKeyModel } from '../../../test/models'
import { ModelConstructor } from '../../model/model-constructor'
import { attribute } from '../expression/logical-operator/attribute.function'
import { TransactBaseOperation } from './transact-base-operation'

describe('TransactBaseOperation', () => {
  class TestOperation<T> extends TransactBaseOperation<T, DynamoDB.Delete, TestOperation<T>> {
    constructor(modelClazz: ModelConstructor<T>) {
      super(modelClazz)
    }

    get transactItem() {
      return {}
    }
  }

  describe('constructor', () => {
    it('should throw when not providing a ModelConstructor', () => {
      expect(() => new TestOperation(<any>null)).toThrow()
    })
    it('should throw when provided ModelConstructor has no @Model decoration', () => {
      class X {}

      expect(() => new TestOperation(X)).toThrow()
    })
  })

  describe('params', () => {
    let op: TestOperation<SimpleWithPartitionKeyModel>
    beforeEach(() => {
      op = new TestOperation(SimpleWithPartitionKeyModel)
    })

    it('returnValuesOnConditionCheckFailure', () => {
      op.returnValuesOnConditionCheckFailure(ReturnValuesOnConditionCheckFailure.ALL_OLD)
      expect(op.params.ReturnValuesOnConditionCheckFailure).toBe('ALL_OLD')
    })

    it('onlyIf', () => {
      op.onlyIf(attribute('age').gt(20))
      expect(op.params).toEqual({
        TableName: 'simple-with-partition-key-models',
        ConditionExpression: '#age > :age',
        ExpressionAttributeNames: { '#age': 'age' },
        ExpressionAttributeValues: { ':age': { N: '20' } },
      })
    })

    it('onlyIfAttribute', () => {
      op.onlyIfAttribute('age').gt(20)
      expect(op.params).toEqual({
        TableName: 'simple-with-partition-key-models',
        ConditionExpression: '#age > :age',
        ExpressionAttributeNames: { '#age': 'age' },
        ExpressionAttributeValues: { ':age': { N: '20' } },
      })
    })
  })
})
