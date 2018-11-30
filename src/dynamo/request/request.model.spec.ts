import { getTableName } from '../../../test/helper'
import {
  ModelWithABunchOfIndexes,
  SimpleWithCompositePartitionKeyModel,
  SimpleWithPartitionKeyModel,
} from '../../../test/models'
import { INDEX_ACTIVE_CREATED_AT, INDEX_COUNT } from '../../../test/models/model-with-indexes.model'
import { ModelConstructor } from '../../model/model-constructor'
import { Request } from './request.model'


class TestRequest<T> extends Request<T, any, any, any> {

  constructor(modelClazz: ModelConstructor<T>) {
    super(<any>null, modelClazz, getTableName(modelClazz))
  }

  exec() {return <any>null}

  execCount() {return <any>null}

  execFullResponse() {return <any>null}

  execNoMap() {return <any>null}

  execSingle() {return <any>null}

}


describe('Request', () => {
  let request: TestRequest<any>

  describe('constructor', () => {
    beforeEach(() => {
      request = new TestRequest(SimpleWithPartitionKeyModel)
    })
    it('should set the default limit to params', () => {
      expect(request.params).toBeDefined()
      expect(request.params.Limit).toBe(Request.DEFAULT_LIMIT)
    })
  })

  describe('exclusiveStartKey', () => {
    beforeEach(() => {
      request = new TestRequest(SimpleWithPartitionKeyModel)
    })

    it('should add ExclusiveStartKey to params', () => {
      request.exclusiveStartKey({ id: { S: 'myId' } })
      expect(request.params.ExclusiveStartKey).toEqual({ id: { S: 'myId' } })
    })

    it('should remove ExclusiveStartKey when providing null', () => {
      request.exclusiveStartKey({ id: { S: 'myId' } })
      expect(request.params.ExclusiveStartKey).toEqual({ id: { S: 'myId' } })

      request.exclusiveStartKey(null)
      expect(request.params.ExclusiveStartKey).toBeUndefined()
      expect(Object.keys(request.params).includes('ExclusiveStartKey')).toBeFalsy()
    })
  })

  describe('index', () => {
    beforeEach(() => {
      request = new TestRequest(ModelWithABunchOfIndexes)
    })

    it('[GSI] should set index on params ', () => {
      request.index(INDEX_ACTIVE_CREATED_AT)
      expect(request.params.IndexName).toBe(INDEX_ACTIVE_CREATED_AT)
    })

    it('[LSI] should set index on params ', () => {
      request.index(INDEX_COUNT)
      expect(request.params.IndexName).toBe(INDEX_COUNT)
    })

    it('should throw when index does not exist on model', () => {
      expect(() => request.index('NON_EXISTENT_INDEX')).toThrow()
    })

  })

  describe('limit', () => {
    beforeEach(() => {
      request = new TestRequest(SimpleWithCompositePartitionKeyModel)
    })

    it('should throw when a number was given less than 1 (except -1, which means INFINITE)', () => {
      expect(() => request.limit(-100)).toThrow()
      expect(() => request.limit(0)).toThrow()
    })

    it('should set limit to params and be overridable', () => {
      request.limit(5)
      expect(request.params.Limit).toBe(5)

      request.limit(10)
      expect(request.params.Limit).toBe(10)
    })

    it('should remove limit when INFINITE_LIMIT was given as arg', () => {
      request.limit(5)
      expect(request.params.Limit).toBe(5)
      request.limit(Request.INFINITE_LIMIT)
      expect(request.params.Limit).toBeUndefined()
      expect(Object.keys(request.params).includes('Limit')).toBeFalsy()
    })

  })

})
