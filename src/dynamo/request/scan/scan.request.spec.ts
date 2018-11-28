import { ScanInput, ScanOutput } from 'aws-sdk/clients/dynamodb'
import { Observable, of } from 'rxjs'
import { getTableName } from '../../../../test/helper'
import { ComplexModel } from '../../../../test/models'
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

  it('should log', async () => {
    await scanRequest.exec().toPromise()
    expect(logInfos.length).toBeGreaterThan(0)
  })
})
