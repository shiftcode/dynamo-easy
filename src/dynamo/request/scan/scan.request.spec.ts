import { ScanInput, ScanOutput } from 'aws-sdk/clients/dynamodb'
import { Observable, of } from 'rxjs'
import { getTableName } from '../../../../test/helper/get-table-name.function'
import { ComplexModel } from '../../../../test/models/complex.model'
import { Request } from '../request.model'
import { ScanRequest } from './scan.request'

class DynamoRxMock {
  scan(): Observable<ScanOutput> {
    return of({ Count: 10 })
  }
}

describe('scan request', () => {
  const dynamoRxMock: DynamoRxMock = new DynamoRxMock()
  let scanRequest: ScanRequest<any>

  beforeEach(() => {
    scanRequest = new ScanRequest(<any>dynamoRxMock, ComplexModel, getTableName(ComplexModel))
  })

  it('default params', () => {
    const params: ScanInput = scanRequest.params
    expect(params.TableName).toBe('complex_model')
    expect(params.Limit).toBe(Request.DEFAULT_LIMIT)
    expect(Object.keys(params).length).toBe(2)
  })
})
