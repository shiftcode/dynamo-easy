import { of } from 'rxjs'
import { getTableName } from '../../../test/helper'
import { SimpleWithPartitionKeyModel } from '../../../test/models'
import { ModelConstructor } from '../../model'
import { or } from '../expression/logical-operator'
import { attribute } from '../expression/logical-operator/attribute.function'
import { WriteRequest } from './write.request'

describe('write request', () => {
  class TestWriteRequest<T> extends WriteRequest<TestWriteRequest<T>, T, any> {
    readonly params: any = {}

    constructor(modelClazz: ModelConstructor<T>) {
      super(<any>null, modelClazz, getTableName(modelClazz))
    }

    exec() {
      return of(null)
    }

    execFullResponse() {
      return of(null)
    }
  }

  describe('params', () => {
    let req: TestWriteRequest<SimpleWithPartitionKeyModel>

    beforeEach(() => {
      req = new TestWriteRequest(SimpleWithPartitionKeyModel)
    })

    it('should set ReturnConsumedCapacity', () => {
      req.returnConsumedCapacity('INDEXES')
      expect(req.params.ReturnConsumedCapacity).toBe('INDEXES')
    })

    it('should set returnItemCollectionMetrics', () => {
      req.returnItemCollectionMetrics('SIZE')
      expect(req.params.ReturnItemCollectionMetrics).toBe('SIZE')
    })

    it('should set returnValues', () => {
      req.returnValues('ALL_OLD')
      expect(req.params.ReturnValues).toBe('ALL_OLD')
    })

    it('[onlyIfAttribute] should set condition', () => {
      req.onlyIfAttribute('age').gt(20)
      expect(req.params.ConditionExpression).toEqual('#age > :age')
      expect(req.params.ExpressionAttributeNames).toEqual({ '#age': 'age' })
      expect(req.params.ExpressionAttributeValues).toEqual({ ':age': { N: '20' } })
    })

    it('[onlyIf] should set condition', () => {
      req.onlyIf(or(attribute('age').lt(10), attribute('age').gt(20)))
      expect(req.params.ConditionExpression).toEqual('((#age < :age OR #age > :age_2))')
      expect(req.params.ExpressionAttributeNames).toEqual({ '#age': 'age' })
      expect(req.params.ExpressionAttributeValues).toEqual({
        ':age': { N: '10' },
        ':age_2': { N: '20' },
      })
    })
  })
})
