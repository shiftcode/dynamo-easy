import { SimpleWithPartitionKeyModel } from '../../../test/models'
import { createLogger, Logger } from '../../logger/logger'
import { Attributes } from '../../mapper/type/attribute.type'
import { ModelConstructor } from '../../model/model-constructor'
import { attribute } from '../expression/logical-operator/attribute.function'
import { or } from '../expression/logical-operator/public.api'
import { WriteRequest } from './write.request'
import { ReturnItemCollectionMetrics } from '@aws-sdk/client-dynamodb'

describe('write request', () => {
  class TestWriteRequest<T> extends WriteRequest<T, T, any, any, TestWriteRequest<T>> {
    protected readonly logger: Logger
    readonly params: any = {}

    constructor(modelClazz: ModelConstructor<T>) {
      super(<any>null, modelClazz)
      this.logger = createLogger('dynamo.request.PutRequest', modelClazz)
    }

    protected doRequest(_params: any): Promise<any> {
      return Promise.resolve(null)
    }
  }

  let req: TestWriteRequest<SimpleWithPartitionKeyModel>

  describe('ReturnValues = NONE', () => {
    let doRequestMock: jest.Mock
    const response = { myValue: true }
    beforeEach(() => {
      req = new TestWriteRequest(SimpleWithPartitionKeyModel)
      doRequestMock = jest.fn().mockReturnValueOnce(Promise.resolve(response))
      Object.assign(req, { doRequest: doRequestMock })
    })

    it('exec should call execFullResponse', async () => {
      await req.exec()
      expect(doRequestMock).toHaveBeenCalled()
    })

    it('exec should return void', async () => {
      expect(await req.exec()).toBeUndefined()
    })

    it('execNoMap should return our specified response', async () => {
      expect(await req.execNoMap()).toEqual(response)
    })
  })

  describe('ReturnValues = ALL_OLD', () => {
    const returnValues: Attributes<SimpleWithPartitionKeyModel> = { id: { S: 'myId' }, age: { N: '20' } }
    beforeEach(() => {
      req = new TestWriteRequest(SimpleWithPartitionKeyModel)
      Object.assign(req, { doRequest: () => Promise.resolve({ Attributes: returnValues }) })
    })
    it('exec should map result if Attributes return values(s)', async () => {
      const result = await req.exec()
      expect(result).toEqual({ id: 'myId', age: 20 })
    })
    it('execNoMap should not map result', async () => {
      const result = await req.execNoMap()
      expect(result).toEqual({ Attributes: returnValues })
    })
  })

  describe('params', () => {
    beforeEach(() => {
      req = new TestWriteRequest(SimpleWithPartitionKeyModel)
    })

    it('should set returnItemCollectionMetrics', () => {
      req.returnItemCollectionMetrics(ReturnItemCollectionMetrics.SIZE)
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
      expect(req.params.ConditionExpression).toEqual('(#age < :age OR #age > :age_2)')
      expect(req.params.ExpressionAttributeNames).toEqual({ '#age': 'age' })
      expect(req.params.ExpressionAttributeValues).toEqual({
        ':age': { N: '10' },
        ':age_2': { N: '20' },
      })
    })
  })
})
