import { SimpleModel, SimpleWithPartitionKeyModel } from '../../../test/models'
import { Attributes } from '../../mapper'
import { ModelConstructor } from '../../model'
import { or } from '../expression/logical-operator'
import { attribute } from '../expression/logical-operator/attribute.function'
import { getTableName } from '../get-table-name.function'
import { WriteOperation } from './write-operation'
import { WriteOperationParams } from './write-operation-params.type'

interface MyWriteOpertationParams<T> extends WriteOperationParams {
  Item: Attributes<T>
}

class MyWriteOperation<T> extends WriteOperation<T, MyWriteOpertationParams<T>, MyWriteOperation<T>> {
  constructor(modelClazz: ModelConstructor<T>) {
    super(modelClazz)
  }
}

describe('write operation', () => {
  describe('constructor', () => {
    let op: MyWriteOperation<SimpleModel>

    beforeEach(() => {
      op = new MyWriteOperation(SimpleModel)
    })

    it('should throw when no modelClazz is given', () => {
      expect(() => new MyWriteOperation(<any>null)).toThrow()
    })
    it('should throw when given class is not @Model decorated', () => {
      expect(() => new MyWriteOperation(MyWriteOperation)).toThrow()
    })

    it('the modelClazz should be accessible through a member var', () => {
      expect(op.modelClazz).toBe(SimpleModel)
    })

    it('the metaData should be created and accessible through a member var', () => {
      expect(op.metadata).toBeDefined()
      expect(op.metadata.modelOptions).toBeDefined()
      expect(op.metadata.modelOptions.clazz).toBe(SimpleModel)
    })

    it('the table name should be written tot the params', () => {
      expect(op.params).toBeDefined()
      expect(op.params.TableName).toBe(getTableName(SimpleModel))
    })
  })

  describe('should set condition', () => {
    let op: MyWriteOperation<SimpleWithPartitionKeyModel>

    beforeEach(() => {
      op = new MyWriteOperation(SimpleWithPartitionKeyModel)
    })

    it('onlyIfAttribute', () => {
      op.onlyIfAttribute('age').gt(20)
      expect(op.params.ConditionExpression).toEqual('#age > :age')
      expect(op.params.ExpressionAttributeNames).toEqual({ '#age': 'age' })
      expect(op.params.ExpressionAttributeValues).toEqual({ ':age': { N: '20' } })
    })

    it('onlyIf', () => {
      op.onlyIf(or(attribute('age').lt(10), attribute('age').gt(20)))
      expect(op.params.ConditionExpression).toEqual('((#age < :age OR #age > :age_2))')
      expect(op.params.ExpressionAttributeNames).toEqual({ '#age': 'age' })
      expect(op.params.ExpressionAttributeValues).toEqual({
        ':age': { N: '10' },
        ':age_2': { N: '20' },
      })
    })
  })
})
