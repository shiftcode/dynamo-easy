import * as DynamoDB from '@aws-sdk/client-dynamodb'
import { ComplexModel, SimpleWithPartitionKeyModel } from '../../../../test/models'
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

  describe('execFetchAll', () => {
    let client: DynamoDB.DynamoDBClient
    let sendMock: jest.Mock
    let req: ScanRequest<SimpleWithPartitionKeyModel>
    let result: SimpleWithPartitionKeyModel[]

    const output1: DynamoDB.ScanCommandOutput = {
      $metadata: {},
      Items: [{ id: { S: 'id-1' }, age: { N: '21' } }],
      Count: 1,
      LastEvaluatedKey: { id: { S: 'id-1' } },
    }
    const output2: DynamoDB.ScanCommandOutput = {
      $metadata: {},
      Items: [{ id: { S: 'id-2' }, age: { N: '22' } }],
      Count: 1,
    }

    beforeEach(async () => {
      // the SDK paginator requires an actual DynamoDBClient instance
      client = new DynamoDB.DynamoDBClient({})
      sendMock = <jest.Mock>(<unknown>jest.spyOn(client, 'send'))
      sendMock.mockReturnValueOnce(Promise.resolve(output1)).mockReturnValueOnce(Promise.resolve(output2))
      req = new ScanRequest(client, SimpleWithPartitionKeyModel)
      result = await req.execFetchAll()
    })

    it('should send ScanCommands until LastEvaluatedKey is undefined', () => {
      expect(sendMock).toHaveBeenCalledTimes(2)
      expect(sendMock.mock.calls[0][0]).toBeInstanceOf(DynamoDB.ScanCommand)
      expect(sendMock.mock.calls[1][0]).toBeInstanceOf(DynamoDB.ScanCommand)
    })

    it('should use LastEvaluatedKey for next request', () => {
      expect(sendMock.mock.calls[1][0].input).toEqual(
        expect.objectContaining(<DynamoDB.ScanInput>{ ExclusiveStartKey: output1.LastEvaluatedKey }),
      )
    })

    it('should concatenate the result items', () => {
      expect(result).toEqual([
        { id: 'id-1', age: 21 },
        { id: 'id-2', age: 22 },
      ])
    })
  })
})
