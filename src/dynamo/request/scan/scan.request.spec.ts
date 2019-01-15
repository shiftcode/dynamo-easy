import * as DynamoDB from 'aws-sdk/clients/dynamodb'
import { ComplexModel } from '../../../../test/models'
import { DynamoDbWrapper } from '../../dynamo-db-wrapper'
import { ReadManyRequest } from '../read-many.request'
import { ScanRequest } from './scan.request'

describe('scan request', () => {
  let request: MyScanRequest
  let scanSpy: jasmine.Spy

  class MyScanRequest extends ScanRequest<ComplexModel> {
    constructor(dynamoDBWrapper: DynamoDbWrapper) {
      super(dynamoDBWrapper, ComplexModel)
    }

    get theLogger() {
      return this.logger
    }
  }

  beforeEach(() => {
    scanSpy = jasmine.createSpy().and.returnValue(Promise.resolve({ Count: 1 }))
    request = new MyScanRequest(<any>{ scan: scanSpy })
  })

  it('extends ReadManyRequest', () => {
    expect(request instanceof ReadManyRequest).toBeTruthy()
  })

  it('default params', () => {
    const params: DynamoDB.ScanInput = request.params
    expect(params.TableName).toBe('complex_model')
    expect(params.Limit).toBe(ReadManyRequest.DEFAULT_LIMIT)
    expect(Object.keys(params).length).toBe(2)
  })

  it('execSingle', async () => {
    await request.execSingle()
    expect(scanSpy).toHaveBeenCalled()
    expect(scanSpy.calls.mostRecent().args[0]).toBeDefined()
    expect(scanSpy.calls.mostRecent().args[0].Limit).toBe(1)
  })

  it('constructor creates logger', () => {
    expect(request.theLogger).toBeDefined()
  })

  it('doRequest uses dynamoDBWrapper.scan', async () => {
    await request.exec()
    expect(scanSpy).toHaveBeenCalled()
  })
})
