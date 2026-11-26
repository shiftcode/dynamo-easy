import * as DynamoDB from '@aws-sdk/client-dynamodb'
import { DynamoDbWrapper } from './dynamo-db-wrapper'

describe('dynamo rx', () => {
  describe('should call the correct dynamoDB method', () => {
    let dynamoDBWrapper: DynamoDbWrapper
    let dynamoDBSpy: jest.SpyInstance
    let pseudoParams: any

    beforeEach(() => {
      pseudoParams = { TableName: 'tableName', KeyConditionExpression: 'blub' }
      dynamoDBWrapper = new DynamoDbWrapper(new DynamoDB.DynamoDB({}))
    })

    afterEach(() => {
      expect(dynamoDBSpy).toHaveBeenCalledTimes(1)
      expect(dynamoDBSpy).toHaveBeenCalledWith(pseudoParams)
    })

    it('putItem', async () => {
      dynamoDBSpy = jest
        .spyOn(dynamoDBWrapper.dynamoDB, 'putItem')
        .mockReturnValueOnce(<any>{ promise: () => Promise.resolve() })
      await dynamoDBWrapper.putItem(pseudoParams)
    })

    it('getItem', async () => {
      dynamoDBSpy = jest
        .spyOn(dynamoDBWrapper.dynamoDB, 'getItem')
        .mockReturnValueOnce(<any>{ promise: () => Promise.resolve() })
      await dynamoDBWrapper.getItem(pseudoParams)
    })

    it('updateItem', async () => {
      dynamoDBSpy = jest
        .spyOn(dynamoDBWrapper.dynamoDB, 'updateItem')
        .mockReturnValueOnce(<any>{ promise: () => Promise.resolve() })
      await dynamoDBWrapper.updateItem(pseudoParams)
    })

    it('deleteItem', async () => {
      dynamoDBSpy = jest
        .spyOn(dynamoDBWrapper.dynamoDB, 'deleteItem')
        .mockReturnValueOnce(<any>{ promise: () => Promise.resolve() })
      await dynamoDBWrapper.deleteItem(pseudoParams)
    })

    it('batchWriteItem', async () => {
      dynamoDBSpy = jest
        .spyOn(dynamoDBWrapper.dynamoDB, 'batchWriteItem')
        .mockReturnValueOnce(<any>{ promise: () => Promise.resolve() })
      await dynamoDBWrapper.batchWriteItem(pseudoParams)
    })

    it('batchGetItems', async () => {
      dynamoDBSpy = jest
        .spyOn(dynamoDBWrapper.dynamoDB, 'batchGetItem')
        .mockReturnValueOnce(<any>{ promise: () => Promise.resolve() })
      await dynamoDBWrapper.batchGetItems(pseudoParams)
    })

    it('transactWriteItems', async () => {
      dynamoDBSpy = jest
        .spyOn(dynamoDBWrapper.dynamoDB, 'transactWriteItems')
        .mockReturnValueOnce(<any>{ promise: () => Promise.resolve() })
      await dynamoDBWrapper.transactWriteItems(pseudoParams)
    })

    it('transactGetItems', async () => {
      dynamoDBSpy = jest
        .spyOn(dynamoDBWrapper.dynamoDB, 'transactGetItems')
        .mockReturnValueOnce(<any>{ promise: () => Promise.resolve() })
      await dynamoDBWrapper.transactGetItems(pseudoParams)
    })

    it('scan', async () => {
      dynamoDBSpy = jest
        .spyOn(dynamoDBWrapper.dynamoDB, 'scan')
        .mockReturnValueOnce(<any>{ promise: () => Promise.resolve() })
      await dynamoDBWrapper.scan(pseudoParams)
    })

    it('query', async () => {
      dynamoDBSpy = jest
        .spyOn(dynamoDBWrapper.dynamoDB, 'query')
        .mockReturnValueOnce(<any>{ promise: () => Promise.resolve() })
      await dynamoDBWrapper.query(pseudoParams)
    })
  })

  describe('query', () => {
    beforeEach(() => {})
    it('should throw when no KeyConditionExpression was given', () => {
      const dynamoDBWrapper = new DynamoDbWrapper(new DynamoDB.DynamoDB({}))
      expect(() => dynamoDBWrapper.query({ TableName: 'tableName' })).toThrow()
    })
  })
})
