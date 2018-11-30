import { of } from 'rxjs'
import { getTableName } from '../../../test/helper'
import { SimpleWithPartitionKeyModel } from '../../../test/models'
import { ModelConstructor } from '../../model'
import { WriteRequest } from './write.request'


describe('write request', () => {
  class TestWriteRequest<T> extends WriteRequest<TestWriteRequest<T>, T, any> {
    constructor(modelClazz: ModelConstructor<T>) {
      super(<any>null, modelClazz, getTableName(modelClazz))
    }

    exec() {return of(null)}

    execFullResponse() { return of(null) }
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

    it('should set condition', () => {
      req.onlyIfAttribute('age').gt(20)
      expect(req.params.ConditionExpression).toEqual('#age > :age')
      expect(req.params.ExpressionAttributeNames).toEqual({ '#age': 'age' })
      expect(req.params.ExpressionAttributeValues).toEqual({ ':age': { 'N': '20' } })
    })

  })

})
