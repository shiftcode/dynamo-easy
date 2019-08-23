import * as DynamoDB from 'aws-sdk/clients/dynamodb'
import {
  ModelWithABunchOfIndexes,
  SimpleWithCompositePartitionKeyModel,
  SimpleWithPartitionKeyModel,
} from '../../../test/models'
import { INDEX_ACTIVE_CREATED_AT, INDEX_COUNT } from '../../../test/models/model-with-indexes.model'
import { updateDynamoEasyConfig } from '../../config/update-config.function'
import { createLogger, Logger } from '../../logger/logger'
import { Attributes } from '../../mapper/type/attribute.type'
import { ModelConstructor } from '../../model/model-constructor'
import { attribute } from '../expression/logical-operator/attribute.function'
import { or } from '../expression/logical-operator/public.api'
import { getTableName } from '../get-table-name.function'
import { ReadManyRequest } from './read-many.request'

class TestRequest<T> extends ReadManyRequest<T, any, any, any, any> {
  constructor(modelClazz: ModelConstructor<T>) {
    super(<any>null, modelClazz)
    this.logger = createLogger('TestRequest', modelClazz)
  }

  protected readonly logger: Logger

  protected doRequest(params: any): Promise<any> {
    return Promise.resolve({})
  }
}

describe('ReadManyRequest', () => {
  let request: TestRequest<any>
  let doRequestSpy: jasmine.Spy

  describe('constructor', () => {
    beforeEach(() => {
      request = new TestRequest(SimpleWithPartitionKeyModel)
    })

    it('should set the default params', () => {
      expect(request.params).toEqual({ TableName: getTableName(SimpleWithPartitionKeyModel) })
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
      request.limit(ReadManyRequest.INFINITE_LIMIT)
      expect(request.params.Limit).toBeUndefined()
      expect(Object.keys(request.params).includes('Limit')).toBeFalsy()
    })
  })

  describe('conditions functions', () => {
    beforeEach(() => {
      request = new TestRequest(SimpleWithPartitionKeyModel)
    })

    it('whereAttribute', () => {
      request.whereAttribute('age').gt(20)
      expect(request.params.FilterExpression).toEqual('#age > :age')
      expect(request.params.ExpressionAttributeNames).toEqual({ '#age': 'age' })
      expect(request.params.ExpressionAttributeValues).toEqual({ ':age': { N: '20' } })
    })

    it('where', () => {
      const conditions = or(attribute('age').lt(10), attribute('age').gt(20))
      const expression = conditions(undefined, undefined)
      request.where(conditions)
      expect(request.params.FilterExpression).toEqual(expression.statement)
      expect(request.params.ExpressionAttributeNames).toEqual(expression.attributeNames)
      expect(request.params.ExpressionAttributeValues).toEqual(expression.attributeValues)
    })
  })

  describe('exec functions', () => {
    const jsItem: SimpleWithPartitionKeyModel = { id: 'myId', age: 15 }
    const dbItem: Attributes<SimpleWithPartitionKeyModel> = {
      id: { S: `${jsItem.id}` },
      age: { N: `${jsItem.age}` },
    }
    const output: DynamoDB.ScanOutput = {
      Items: [dbItem, dbItem],
      Count: 2,
      ConsumedCapacity: { TableName: getTableName(SimpleWithPartitionKeyModel) },
    }
    beforeEach(() => {
      request = new TestRequest(SimpleWithPartitionKeyModel)
      doRequestSpy = jasmine.createSpy().and.returnValues(Promise.resolve(output), Promise.resolve({}))
      Object.assign(request, { doRequest: doRequestSpy })
    })

    it('execFullResponse', async () => {
      const res = await request.execFullResponse()
      expect(res).toEqual({ ...output, Items: [jsItem, jsItem] })
    })

    it('execNoMap', async () => {
      const res = await request.execNoMap()
      expect(res).toEqual(output)
    })

    it('exec', async () => {
      const res = await request.exec()
      expect(res).toEqual([jsItem, jsItem])
    })

    it('execSingle', async () => {
      const res = await request.execSingle()
      expect(doRequestSpy).toHaveBeenCalled()
      expect(doRequestSpy.calls.mostRecent().args[0]).toBeDefined()
      expect(doRequestSpy.calls.mostRecent().args[0].Limit).toBe(1)
      expect(res).toEqual(jsItem)
    })

    it('execSingle should not alter request params', async () => {
      await request.execSingle()
      expect(request.params.Limit).toBeUndefined()
    })

    it('execSingle empty response', async () => {
      // ignore first call which has results
      await request.execSingle()

      const res = await request.execSingle()
      expect(res).toBe(null)
    })

    it('execCount', async () => {
      const res = await request.execCount()
      expect(doRequestSpy).toHaveBeenCalled()
      expect(doRequestSpy.calls.mostRecent().args[0]).toBeDefined()
      expect(doRequestSpy.calls.mostRecent().args[0].Select).toBe('COUNT')
      expect(res).toBe(output.Count)
    })

    it('execCount should not alter request params', async () => {
      await request.execCount()
      expect(request.params.Select).toBeUndefined()
    })

    it('execCount empty response', async () => {
      // ignore first call which has results
      await request.execCount()

      const res = await request.execCount()
      expect(res).toBe(0)
    })

    it('execFetchAll', async () => {
      const res = await request.execFetchAll()
      expect(res).toEqual([jsItem, jsItem])
    })
  })

  describe('logger', () => {
    const output: DynamoDB.ScanOutput = { Items: [] }
    let logReceiver: jasmine.Spy

    beforeEach(() => {
      logReceiver = jasmine.createSpy()
      updateDynamoEasyConfig({ logReceiver })
      request = new TestRequest(SimpleWithPartitionKeyModel)

      doRequestSpy = jasmine.createSpy().and.returnValue(Promise.resolve(output))
      Object.assign(request, { doRequest: doRequestSpy })
    })

    it('exec should log params and response', async () => {
      await request.exec()
      expect(logReceiver).toHaveBeenCalled()
      const logInfoData = logReceiver.calls.allArgs().map(i => i[0].data)
      expect(logInfoData.includes(request.params)).toBeTruthy()
      expect(logInfoData.includes(output)).toBeTruthy()
    })

    it('execFullResponse should log params and response', async () => {
      await request.execFullResponse()
      expect(logReceiver).toHaveBeenCalled()
      const logInfoData = logReceiver.calls.allArgs().map(i => i[0].data)
      expect(logInfoData.includes(request.params)).toBeTruthy()
      expect(logInfoData.includes(output)).toBeTruthy()
    })
  })
})
