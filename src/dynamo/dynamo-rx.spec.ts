// tslint:disable:no-empty
// tslint:disable:no-unnecessary-callback-wrapper

import { Config, Credentials } from 'aws-sdk/global'
import { of } from 'rxjs'
import { resetDynamoEasyConfig } from '../../test/helper/resetDynamoEasyConfig.function'
import { updateDynamoEasyConfig } from '../config'
import { DynamoRx } from './dynamo-rx'

describe('dynamo rx', () => {
  describe('should call the validity ensurer before each call and call the correct dynamoDB method', () => {
    let dynamoRx: DynamoRx
    let sessionValidityEnsurerSpy: jasmine.Spy
    let dynamoDBSpy: jasmine.Spy
    let pseudoParams: any

    beforeEach(() => {
      pseudoParams = { TableName: 'tableName', KeyConditionExpression: 'blub' }
      sessionValidityEnsurerSpy = jasmine.createSpy().and.returnValue(of(true))
      updateDynamoEasyConfig({ sessionValidityEnsurer: sessionValidityEnsurerSpy })
      dynamoRx = new DynamoRx()
    })

    afterEach(() => {
      resetDynamoEasyConfig()
      expect(sessionValidityEnsurerSpy).toHaveBeenCalled()
      expect(dynamoDBSpy).toHaveBeenCalledTimes(1)
      expect(dynamoDBSpy).toHaveBeenCalledWith(pseudoParams)
    })

    it('putItem', async () => {
      dynamoDBSpy = spyOn(dynamoRx.dynamoDB, 'putItem').and.returnValue({ promise: () => Promise.resolve() })
      await dynamoRx.putItem(pseudoParams).toPromise()
    })

    it('getItem', async () => {
      dynamoDBSpy = spyOn(dynamoRx.dynamoDB, 'getItem').and.returnValue({ promise: () => Promise.resolve() })
      await dynamoRx.getItem(pseudoParams).toPromise()
    })

    it('updateItem', async () => {
      dynamoDBSpy = spyOn(dynamoRx.dynamoDB, 'updateItem').and.returnValue({ promise: () => Promise.resolve() })
      await dynamoRx.updateItem(pseudoParams).toPromise()
    })

    it('deleteItem', async () => {
      dynamoDBSpy = spyOn(dynamoRx.dynamoDB, 'deleteItem').and.returnValue({ promise: () => Promise.resolve() })
      await dynamoRx.deleteItem(pseudoParams).toPromise()
    })

    it('batchWriteItem', async () => {
      dynamoDBSpy = spyOn(dynamoRx.dynamoDB, 'batchWriteItem').and.returnValue({ promise: () => Promise.resolve() })
      await dynamoRx.batchWriteItem(pseudoParams).toPromise()
    })

    it('batchGetItems', async () => {
      dynamoDBSpy = spyOn(dynamoRx.dynamoDB, 'batchGetItem').and.returnValue({ promise: () => Promise.resolve() })
      await dynamoRx.batchGetItems(pseudoParams).toPromise()
    })

    it('transactWriteItems', async () => {
      dynamoDBSpy = spyOn(dynamoRx.dynamoDB, 'transactWriteItems').and.returnValue({ promise: () => Promise.resolve() })
      await dynamoRx.transactWriteItems(pseudoParams).toPromise()
    })

    it('transactGetItems', async () => {
      dynamoDBSpy = spyOn(dynamoRx.dynamoDB, 'transactGetItems').and.returnValue({ promise: () => Promise.resolve() })
      await dynamoRx.transactGetItems(pseudoParams).toPromise()
    })

    it('scan', async () => {
      dynamoDBSpy = spyOn(dynamoRx.dynamoDB, 'scan').and.returnValue({ promise: () => Promise.resolve() })
      await dynamoRx.scan(pseudoParams).toPromise()
    })

    it('query', async () => {
      dynamoDBSpy = spyOn(dynamoRx.dynamoDB, 'query').and.returnValue({ promise: () => Promise.resolve() })
      await dynamoRx.query(pseudoParams).toPromise()
    })
  })

  describe('makeRequest', async () => {
    let dynamoRx: DynamoRx
    let sessionValidityEnsurerSpy: jasmine.Spy
    let dynamoDBSpy: jasmine.Spy
    let pseudoParams: any

    beforeEach(() => {
      pseudoParams = { TableName: 'tableName', KeyConditionExpression: 'blub' }
      sessionValidityEnsurerSpy = jasmine.createSpy().and.returnValue(of(true))
      updateDynamoEasyConfig({ sessionValidityEnsurer: sessionValidityEnsurerSpy })
      dynamoRx = new DynamoRx()
    })

    afterEach(() => {
      resetDynamoEasyConfig()
      expect(sessionValidityEnsurerSpy).toHaveBeenCalled()
      expect(dynamoDBSpy).toHaveBeenCalledTimes(1)
      expect(dynamoDBSpy).toHaveBeenCalledWith('pseudoOperation', pseudoParams)
    })

    it('should call the validity ensurer before each call and call the correct dynamoDB method', async () => {
      dynamoDBSpy = spyOn(dynamoRx.dynamoDB, 'makeRequest').and.returnValue({ promise: () => Promise.resolve() })
      await dynamoRx.makeRequest('pseudoOperation', pseudoParams).toPromise()
    })
  })

  describe('query', () => {
    beforeEach(() => {})
    it('should throw when no KeyConditionExpression was given', () => {
      const dynamoRx = new DynamoRx()
      expect(() => dynamoRx.query({ TableName: 'tableName' })).toThrow()
    })
  })

  it('should call makeRequest with the given params', async () => {
    const dynamoRx = new DynamoRx()
    const makeRequest = jasmine.createSpy().and.returnValue({ promise: () => Promise.resolve(null) })
    Object.assign(dynamoRx, { dynamoDB: { makeRequest } })

    await dynamoRx.makeRequest(<any>{ ok: true }).toPromise()
    expect(makeRequest).toHaveBeenCalled()
    expect(makeRequest.calls.mostRecent().args[0]).toEqual({ ok: true })
  })

  it('should update the credentials', () => {
    const dynamoRx = new DynamoRx()
    const credentials = new Credentials({ secretAccessKey: '', sessionToken: '', accessKeyId: '' })
    dynamoRx.updateAwsConfigCredentials(new Config({ credentials }))
    expect(dynamoRx.dynamoDB.config.credentials).toBe(credentials)
  })
})
