import { of } from 'rxjs'
import { getTableName } from '../../../test/helper'
import { SimpleWithPartitionKeyModel } from '../../../test/models'
import { ModelConstructor } from '../../model'
import { BaseRequest } from './base.request'

describe('base request', () => {
  describe('constructor', () => {

    class TestRequest<T> extends BaseRequest<T, any> {
      constructor(modelClazz: ModelConstructor<T>) {
        super(<any>null, modelClazz, getTableName(modelClazz))
      }

      exec() {return of(null)}

      execFullResponse() {return of(null)}
    }

    it('should throw when model class is null or undefined', () => {
      expect(() => new TestRequest(<any>null)).toThrow()
    })


    it('should create params object with TableName set', () => {
      const testReq = new TestRequest(SimpleWithPartitionKeyModel)
      expect(testReq.params).toBeDefined()
      expect(testReq.params.TableName).toBeDefined()
      expect(testReq.params.TableName).toBe(getTableName(SimpleWithPartitionKeyModel))
    })

  })
})
