// tslint:disable:max-classes-per-file
import { of } from 'rxjs'
import { map } from 'rxjs/operators'
import { SimpleWithPartitionKeyModel } from '../../../test/models'
import { ModelConstructor } from '../../model'
import { BaseRequest } from './base.request'

describe('base request', () => {
  class TestRequest<T> extends BaseRequest<T, any, BaseRequest<T, any, any>> {
    constructor(modelClazz: ModelConstructor<T>) {
      super(<any>null, modelClazz)
    }

    exec() {
      return of(null).pipe(
        map(() => {
          return
        }),
      )
    }

    execFullResponse() {
      return of(null)
    }
  }

  let request: TestRequest<SimpleWithPartitionKeyModel>

  describe('constructor', () => {
    beforeEach(() => {
      request = new TestRequest(SimpleWithPartitionKeyModel)
    })

    it('should throw when node ModelConstructor was provided', () => {
      expect(() => new TestRequest(<any>null)).toThrow()
    })

    it('should throw when ModelConstructor is not @Model decorated', () => {
      class NoModel {
        prop: any
      }

      expect(() => new TestRequest(NoModel)).toThrow()
    })

    it('should store model class', () => {
      expect(request.modelClazz).toBe(SimpleWithPartitionKeyModel)
    })

    it('should create metadata of given modelConstructor', () => {
      expect(request.metadata).toBeDefined()
      expect(request.metadata.modelOptions).toBeDefined()
      expect(request.metadata.modelOptions.clazz).toBe(SimpleWithPartitionKeyModel)
    })

    it('should create empty params object', () => {
      expect(request.params).toEqual({})
    })
  })

  describe('returnConsumedCapacity', () => {
    beforeEach(() => {
      request = new TestRequest(SimpleWithPartitionKeyModel)
    })
    it('should set param', () => {
      request.returnConsumedCapacity('TOTAL')
      expect(request.params.ReturnConsumedCapacity).toBe('TOTAL')
    })
    it('should return request instance', () => {
      expect(request.returnConsumedCapacity('TOTAL')).toBe(request)
    })
  })
})
