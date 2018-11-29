import { ScanInput, ScanOutput } from 'aws-sdk/clients/dynamodb'
import { Observable, of } from 'rxjs'
import { getTableName } from '../../../../test/helper'
import { ComplexModel, SimpleWithPartitionKeyModel } from '../../../../test/models'
import { updateDynamoEasyConfig } from '../../../config'
import { LogInfo } from '../../../logger'
import { Request } from '../request.model'
import { ScanRequest } from './scan.request'

class DynamoRxMock {
  scan(): Observable<ScanOutput> {
    return of({ Count: 10 })
  }
}

let logInfos: LogInfo[]
updateDynamoEasyConfig({ logReceiver: item => logInfos.push(item) })

describe('scan request', () => {
  const dynamoRxMock: DynamoRxMock = new DynamoRxMock()
  let scanRequest: ScanRequest<any>

  beforeEach(() => {
    scanRequest = new ScanRequest(<any>dynamoRxMock, ComplexModel, getTableName(ComplexModel))
    logInfos = []
  })

  it('default params', () => {
    const params: ScanInput = scanRequest.params
    expect(params.TableName).toBe('complex_model')
    expect(params.Limit).toBe(Request.DEFAULT_LIMIT)
    expect(Object.keys(params).length).toBe(2)
  })

  describe('logger', () => {
    const sampleResponse: ScanOutput = { Items: [] }
    let logReceiver: jasmine.Spy
    let scanSpy: jasmine.Spy
    let req: ScanRequest<SimpleWithPartitionKeyModel>

    beforeEach(() => {
      logReceiver = jasmine.createSpy()
      scanSpy = jasmine.createSpy().and.returnValue(of(sampleResponse))
      updateDynamoEasyConfig({ logReceiver })
      req = new ScanRequest(<any>{ scan: scanSpy }, SimpleWithPartitionKeyModel, getTableName(SimpleWithPartitionKeyModel))
    })

    it('exec should log params and response', async () => {
      await req.exec().toPromise()
      expect(logReceiver).toHaveBeenCalled()
      const logInfoData = logReceiver.calls.allArgs().map(i => i[0].data)
      expect(logInfoData.includes(req.params)).toBeTruthy()
      expect(logInfoData.includes(sampleResponse)).toBeTruthy()
    })

    it('execFullResponse should log params and response', async () => {
      await req.execFullResponse().toPromise()
      expect(logReceiver).toHaveBeenCalled()
      const logInfoData = logReceiver.calls.allArgs().map(i => i[0].data)
      expect(logInfoData.includes(req.params)).toBeTruthy()
      expect(logInfoData.includes(sampleResponse)).toBeTruthy()
    })

  })
})
