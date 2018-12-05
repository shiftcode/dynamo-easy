import { of } from 'rxjs'
import { SimpleWithPartitionKeyModel } from '../../../test/models'
import { ModelConstructor } from '../../model'
import { BaseRequest } from './base.request'

describe('base request', () => {
  describe('constructor', () => {
    class TestRequest<T> extends BaseRequest<T, any> {
      constructor(modelClazz: ModelConstructor<T>) {
        super(<any>null, modelClazz)
      }

      exec() {
        return of(null)
      }

      execFullResponse() {
        return of(null)
      }
    }

    it('should throw when model class is null or undefined', () => {
      expect(() => new TestRequest(<any>null)).toThrow()
    })

    it('should store model class', () => {
      const i = new TestRequest(SimpleWithPartitionKeyModel)
      expect(i.modelClazz).toBe(SimpleWithPartitionKeyModel)
    })

    it('should store model class', () => {
      const i = new TestRequest(SimpleWithPartitionKeyModel)
      expect(i.metadata).toBeDefined()
      expect(i.metadata.modelOptions).toBeDefined()
      expect(i.metadata.modelOptions.clazz).toBe(SimpleWithPartitionKeyModel)
    })
  })
})
