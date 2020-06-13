import * as DynamoDB from 'aws-sdk/clients/dynamodb'
import { resetDynamoEasyConfig } from '../../test/helper/resetDynamoEasyConfig.function'
import { updateDynamoEasyConfig } from '../config/update-config.function'
import { DynamoDbWrapper } from './dynamo-db-wrapper'

describe('dynamo rx', () => {
  describe('should call the validity ensurer before each call and call the correct dynamoDB method', () => {
    let dynamoDBWrapper: DynamoDbWrapper
    let sessionValidityEnsurerSpy: jasmine.Spy
    let dynamoDBSpy: jasmine.Spy
    let pseudoParams: any

    beforeEach(() => {
      pseudoParams = { TableName: 'tableName', KeyConditionExpression: 'blub' }
      sessionValidityEnsurerSpy = jasmine.createSpy().and.returnValue(Promise.resolve())
      updateDynamoEasyConfig({ sessionValidityEnsurer: sessionValidityEnsurerSpy })
      dynamoDBWrapper = new DynamoDbWrapper()
    })

    afterEach(() => {
      resetDynamoEasyConfig()
      expect(sessionValidityEnsurerSpy).toHaveBeenCalled()
      expect(dynamoDBSpy).toHaveBeenCalledTimes(1)
      expect(dynamoDBSpy).toHaveBeenCalledWith(pseudoParams)
    })

    it('putItem', async () => {
      dynamoDBSpy = spyOn(dynamoDBWrapper.dynamoDB, 'putItem').and.returnValue({ promise: () => Promise.resolve() })
      await dynamoDBWrapper.putItem(pseudoParams)
    })

    it('getItem', async () => {
      dynamoDBSpy = spyOn(dynamoDBWrapper.dynamoDB, 'getItem').and.returnValue({ promise: () => Promise.resolve() })
      await dynamoDBWrapper.getItem(pseudoParams)
    })

    it('updateItem', async () => {
      dynamoDBSpy = spyOn(dynamoDBWrapper.dynamoDB, 'updateItem').and.returnValue({ promise: () => Promise.resolve() })
      await dynamoDBWrapper.updateItem(pseudoParams)
    })

    it('deleteItem', async () => {
      dynamoDBSpy = spyOn(dynamoDBWrapper.dynamoDB, 'deleteItem').and.returnValue({ promise: () => Promise.resolve() })
      await dynamoDBWrapper.deleteItem(pseudoParams)
    })

    it('batchWriteItem', async () => {
      dynamoDBSpy = spyOn(dynamoDBWrapper.dynamoDB, 'batchWriteItem').and.returnValue({
        promise: () => Promise.resolve(),
      })
      await dynamoDBWrapper.batchWriteItem(pseudoParams)
    })

    it('batchGetItems', async () => {
      dynamoDBSpy = spyOn(dynamoDBWrapper.dynamoDB, 'batchGetItem').and.returnValue({
        promise: () => Promise.resolve(),
      })
      await dynamoDBWrapper.batchGetItems(pseudoParams)
    })

    it('transactWriteItems', async () => {
      dynamoDBSpy = spyOn(dynamoDBWrapper.dynamoDB, 'transactWriteItems').and.returnValue({
        promise: () => Promise.resolve(),
      })
      await dynamoDBWrapper.transactWriteItems(pseudoParams)
    })

    it('transactGetItems', async () => {
      dynamoDBSpy = spyOn(dynamoDBWrapper.dynamoDB, 'transactGetItems').and.returnValue({
        promise: () => Promise.resolve(),
      })
      await dynamoDBWrapper.transactGetItems(pseudoParams)
    })

    it('scan', async () => {
      dynamoDBSpy = spyOn(dynamoDBWrapper.dynamoDB, 'scan').and.returnValue({ promise: () => Promise.resolve() })
      await dynamoDBWrapper.scan(pseudoParams)
    })

    it('query', async () => {
      dynamoDBSpy = spyOn(dynamoDBWrapper.dynamoDB, 'query').and.returnValue({ promise: () => Promise.resolve() })
      await dynamoDBWrapper.query(pseudoParams)
    })
  })

  describe('makeRequest', () => {
    let dynamoDBWrapper: DynamoDbWrapper
    let sessionValidityEnsurerSpy: jasmine.Spy
    let dynamoDBSpy: jasmine.Spy
    let pseudoParams: any

    beforeEach(() => {
      pseudoParams = { TableName: 'tableName', KeyConditionExpression: 'blub' }
      sessionValidityEnsurerSpy = jasmine.createSpy().and.returnValue(Promise.resolve(true))
      updateDynamoEasyConfig({ sessionValidityEnsurer: sessionValidityEnsurerSpy })
      dynamoDBWrapper = new DynamoDbWrapper()
    })

    afterEach(() => {
      resetDynamoEasyConfig()
      expect(sessionValidityEnsurerSpy).toHaveBeenCalled()
      expect(dynamoDBSpy).toHaveBeenCalledTimes(1)
      expect(dynamoDBSpy).toHaveBeenCalledWith('pseudoOperation', pseudoParams)
    })

    it('should call the validity ensurer before each call and call the correct dynamoDB method', async () => {
      dynamoDBSpy = spyOn(dynamoDBWrapper.dynamoDB, 'makeRequest').and.returnValue({ promise: () => Promise.resolve() })
      await dynamoDBWrapper.makeRequest('pseudoOperation', pseudoParams)
    })
  })

  describe('query', () => {
    it('should throw when no KeyConditionExpression was given', () => {
      const dynamoDBWrapper = new DynamoDbWrapper()
      expect(() => dynamoDBWrapper.query({ TableName: 'tableName' })).toThrow()
    })
  })

  it('should call makeRequest with the given params', async () => {
    const dynamoDBWrapper = new DynamoDbWrapper()
    const makeRequest = jasmine.createSpy().and.returnValue({ promise: () => Promise.resolve(null) })
    Object.assign(dynamoDBWrapper, { dynamoDB: { makeRequest } })

    await dynamoDBWrapper.makeRequest(<any>{ ok: true })
    expect(makeRequest).toHaveBeenCalled()
    expect(makeRequest.calls.mostRecent().args[0]).toEqual({ ok: true })
  })

  it('should use given dynamoDB client', () => {
    const dynamoDB = new DynamoDB()
    const dynamoDBWrapper = new DynamoDbWrapper(dynamoDB)
    expect(dynamoDBWrapper.dynamoDB).toBe(dynamoDB)

    const dynamoDBWrapper2 = new DynamoDbWrapper()
    expect(dynamoDBWrapper2.dynamoDB).not.toBe(dynamoDB)
  })
})
