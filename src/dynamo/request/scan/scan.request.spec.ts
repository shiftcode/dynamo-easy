import * as DynamoDB from '@aws-sdk/client-dynamodb'
import { ComplexModel } from '../../../../test/models'
import { DynamoDbWrapper } from '../../dynamo-db-wrapper'
import { ReadManyRequest } from '../read-many.request'
import { ScanRequest } from './scan.request'

describe('scan request', () => {
  let request: MyScanRequest
  let scanMock: jest.Mock

  class MyScanRequest extends ScanRequest<ComplexModel> {
    constructor(dynamoDBWrapper: DynamoDbWrapper) {
      super(dynamoDBWrapper, ComplexModel)
    }

    get theLogger() {
      return this.logger
    }
  }

  beforeEach(() => {
    scanMock = jest.fn().mockReturnValueOnce(Promise.resolve({ Count: 1 }))
    request = new MyScanRequest(<any>{ scan: scanMock })
  })

  it('extends ReadManyRequest', () => {
    expect(request instanceof ReadManyRequest).toBeTruthy()
  })

  it('default params', () => {
    expect(request.params).toEqual(<DynamoDB.ScanInput>{ TableName: 'complex_model' })
  })

  it('execSingle', async () => {
    await request.execSingle()
    expect(scanMock).toHaveBeenCalled()
    expect(scanMock).toHaveBeenLastCalledWith(expect.objectContaining({ Limit: 1 }))
  })

  it('constructor creates logger', () => {
    expect(request.theLogger).toBeDefined()
  })

  it('doRequest uses dynamoDBWrapper.scan', async () => {
    await request.exec()
    expect(scanMock).toHaveBeenCalled()
  })
})
