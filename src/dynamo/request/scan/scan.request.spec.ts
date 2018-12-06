import { ScanInput, ScanOutput } from 'aws-sdk/clients/dynamodb'
import { EMPTY, of } from 'rxjs'
import { ComplexModel, SimpleWithPartitionKeyModel } from '../../../../test/models'
import { updateDynamoEasyConfig } from '../../../config'
import { Attributes } from '../../../mapper'
import { or } from '../../expression/logical-operator'
import { attribute } from '../../expression/logical-operator/attribute.function'
import { Request } from '../request.model'
import { ScanRequest } from './scan.request'

describe('scan request', () => {
  let scanSpy: jasmine.Spy

  describe('default params', () => {
    let scanRequest: ScanRequest<ComplexModel>
    beforeEach(() => {
      scanSpy = jasmine.createSpy().and.returnValue(of({ Count: 1 }))
      scanRequest = new ScanRequest(<any>{ scan: scanSpy }, ComplexModel)
    })

    it('default params', () => {
      const params: ScanInput = scanRequest.params
      expect(params.TableName).toBe('complex_model')
      expect(params.Limit).toBe(Request.DEFAULT_LIMIT)
      expect(Object.keys(params).length).toBe(2)
    })
  })

  describe('conditions functions', () => {
    let scanRequest: ScanRequest<SimpleWithPartitionKeyModel>
    beforeEach(() => {
      scanSpy = jasmine.createSpy().and.returnValue(EMPTY)
      scanRequest = new ScanRequest(<any>{ scan: scanSpy }, SimpleWithPartitionKeyModel)
    })

    it('whereAttribute', () => {
      scanRequest.whereAttribute('age').gt(20)
      expect(scanRequest.params.FilterExpression).toEqual('#age > :age')
      expect(scanRequest.params.ExpressionAttributeNames).toEqual({ '#age': 'age' })
      expect(scanRequest.params.ExpressionAttributeValues).toEqual({ ':age': { N: '20' } })
    })
    it('where', () => {
      scanRequest.where(or(attribute('age').lt(10), attribute('age').gt(20)))
      expect(scanRequest.params.FilterExpression).toEqual('((#age < :age OR #age > :age_2))')
      expect(scanRequest.params.ExpressionAttributeNames).toEqual({ '#age': 'age' })
      expect(scanRequest.params.ExpressionAttributeValues).toEqual({
        ':age': { N: '10' },
        ':age_2': { N: '20' },
      })
    })
  })

  describe('exec functions', () => {
    let scanRequest: ScanRequest<SimpleWithPartitionKeyModel>
    const jsItem: SimpleWithPartitionKeyModel = { id: 'myId', age: 15 }
    const dbItem: Attributes<SimpleWithPartitionKeyModel> = {
      id: { S: `${jsItem.id}` },
      age: { N: `${jsItem.age}` },
    }
    const scanOutput: ScanOutput = {
      Count: 2,
      Items: [dbItem, dbItem],
    }
    beforeEach(() => {
      scanSpy = jasmine.createSpy().and.returnValue(of(scanOutput))
      scanRequest = new ScanRequest(<any>{ scan: scanSpy }, SimpleWithPartitionKeyModel)
    })

    it('execFullResponse', async () => {
      const res = await scanRequest.execFullResponse().toPromise()
      expect(res).toEqual({ ...scanOutput, Items: [jsItem, jsItem] })
    })

    it('execNoMap', async () => {
      const res = await scanRequest.execNoMap().toPromise()
      expect(res).toEqual(scanOutput)
    })

    it('exec', async () => {
      const res = await scanRequest.exec().toPromise()
      expect(res).toEqual([jsItem, jsItem])
    })

    it('execSingle', async () => {
      const res = await scanRequest.execSingle().toPromise()
      // todo: uncomment when todo in scanRequest::execSingle was done
      // expect(scanSpy).toHaveBeenCalled()
      // expect(scanSpy.calls.mostRecent().args[0]).toBeDefined()
      // expect(scanSpy.calls.mostRecent().args[0].Limit).toBe(1)
      expect(res).toEqual(jsItem)
    })

    it('execCount', async () => {
      const res = await scanRequest.execCount().toPromise()
      expect(scanSpy).toHaveBeenCalled()
      expect(scanSpy.calls.mostRecent().args[0]).toBeDefined()
      expect(scanSpy.calls.mostRecent().args[0].Select).toBe('COUNT')
      expect(res).toBe(scanOutput.Count)
    })

    it('execFetchAll', async () => {
      const res = await scanRequest.execFetchAll().toPromise()
      expect(res).toEqual([jsItem, jsItem])
    })
  })

  describe('logger', () => {
    let scanRequest: ScanRequest<SimpleWithPartitionKeyModel>
    const sampleResponse: ScanOutput = { Items: [] }
    let logReceiver: jasmine.Spy

    beforeEach(() => {
      logReceiver = jasmine.createSpy()
      scanSpy = jasmine.createSpy().and.returnValue(of(sampleResponse))
      updateDynamoEasyConfig({ logReceiver })
      scanRequest = new ScanRequest(<any>{ scan: scanSpy }, SimpleWithPartitionKeyModel)
    })

    it('exec should log params and response', async () => {
      await scanRequest.exec().toPromise()
      expect(logReceiver).toHaveBeenCalled()
      const logInfoData = logReceiver.calls.allArgs().map(i => i[0].data)
      expect(logInfoData.includes(scanRequest.params)).toBeTruthy()
      expect(logInfoData.includes(sampleResponse)).toBeTruthy()
    })

    it('execFullResponse should log params and response', async () => {
      await scanRequest.execFullResponse().toPromise()
      expect(logReceiver).toHaveBeenCalled()
      const logInfoData = logReceiver.calls.allArgs().map(i => i[0].data)
      expect(logInfoData.includes(scanRequest.params)).toBeTruthy()
      expect(logInfoData.includes(sampleResponse)).toBeTruthy()
    })
  })
})
