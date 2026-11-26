import * as DynamoDB from '@aws-sdk/client-dynamodb'
import { ComplexModel } from '../../../../test/models'
import { ReadManyRequest } from '../read-many.request'
import { ScanRequest } from './scan.request'

describe('scan request', () => {
  let request: MyScanRequest
  let scanMock: jest.Mock

  class MyScanRequest extends ScanRequest<ComplexModel> {
    constructor(client: DynamoDB.DynamoDBClient) {
      super(client, ComplexModel)
    }

    get theLogger() {
      return this.logger
    }
  }

  beforeEach(() => {
    scanMock = jest.fn().mockReturnValueOnce(Promise.resolve({ Count: 1 }))
    request = new MyScanRequest(<any>{ send: scanMock })
  })

  it('extends ReadManyRequest', () => {
    expect(request instanceof ReadManyRequest).toBeTruthy()
  })

  it('default params', () => {
    expect(request.params).toEqual({ TableName: 'complex_model' })
  })

  it('execSingle', async () => {
    await request.execSingle()
    expect(scanMock).toHaveBeenCalled()
    expect(scanMock.mock.calls[0][0].input).toEqual(expect.objectContaining({ Limit: 1 }))
  })

  it('constructor creates logger', () => {
    expect(request.theLogger).toBeDefined()
  })

  it('doRequest sends a ScanCommand', async () => {
    await request.exec()
    expect(scanMock).toHaveBeenCalled()
    expect(scanMock.mock.calls[0][0]).toBeInstanceOf(DynamoDB.ScanCommand)
    expect(scanMock.mock.calls[0][0].input).toEqual(request.params)
  })
})
