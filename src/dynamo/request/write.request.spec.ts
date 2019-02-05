import { SimpleWithPartitionKeyModel } from '../../../test/models'
import { createLogger, Logger } from '../../logger/logger'
import { Attributes } from '../../mapper/type/attribute.type'
import { ModelConstructor } from '../../model/model-constructor'
import { attribute } from '../expression/logical-operator/attribute.function'
import { or } from '../expression/logical-operator/public.api'
import { WriteRequest } from './write.request'

describe('write request', () => {
  class TestWriteRequest<T> extends WriteRequest<T, any, TestWriteRequest<T>> {
    protected readonly logger: Logger
    readonly params: any = {}

    constructor(modelClazz: ModelConstructor<T>) {
      super(<any>null, modelClazz)
      this.logger = createLogger('dynamo.request.PutRequest', modelClazz)
    }

    execFullResponse() {
      return Promise.resolve(null)
    }
  }

  let req: TestWriteRequest<SimpleWithPartitionKeyModel>

  describe('exec [ReturnValues = NONE]', () => {
    let execFullResponseSpy: jasmine.Spy
    beforeEach(() => {
      req = new TestWriteRequest(SimpleWithPartitionKeyModel)
      execFullResponseSpy = jasmine.createSpy().and.returnValue(Promise.resolve({ myValue: true }))
      Object.assign(req, { execFullResponse: execFullResponseSpy })
    })

    it('should call execFullResponse', async () => {
      await req.exec()
      expect(execFullResponseSpy).toHaveBeenCalled()
    })

    it('should return void', async () => {
      expect(await req.exec()).toBeUndefined()
    })
  })

  describe('exec [ReturnValues = ALL_OLD]', () => {
    beforeEach(() => {
      req = new TestWriteRequest(SimpleWithPartitionKeyModel)
      const returnValues: Attributes<SimpleWithPartitionKeyModel> = { id: { S: 'myId' }, age: { N: '20' } }
      spyOn(req, 'execFullResponse').and.returnValue(Promise.resolve({ Attributes: returnValues }))
    })
    it('should map result if Attributes return values(s)', async () => {
      const result = await req.exec()
      expect(result).toEqual({ id: 'myId', age: 20 })
    })
  })

  describe('params', () => {
    beforeEach(() => {
      req = new TestWriteRequest(SimpleWithPartitionKeyModel)
    })

    it('should set returnItemCollectionMetrics', () => {
      req.returnItemCollectionMetrics('SIZE')
      expect(req.params.ReturnItemCollectionMetrics).toBe('SIZE')
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
