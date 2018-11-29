// tslint:disable:no-empty

import { Config, Credentials } from 'aws-sdk'
import { EMPTY, Observable } from 'rxjs'
import { DEFAULT_SESSION_VALIDITY_ENSURER } from './default-session-validity-ensurer.const'
import { DynamoRx } from './dynamo-rx'
import { SessionValidityEnsurer } from './session-validity-ensurer.type'

describe('dynamo rx', () => {


  describe('should call the validity ensurer before each call and return an observable', () => {
    let dynamoRx: DynamoRx
    let spyValidityEnsurer: SessionValidityEnsurer

    beforeEach(() => {
      spyValidityEnsurer = jasmine.createSpy().and.returnValue(EMPTY)
      dynamoRx = new DynamoRx(spyValidityEnsurer)
    })

    it('putItem', () => {
      expect(dynamoRx.putItem(<any>null) instanceof Observable).toBeTruthy()
      expect(spyValidityEnsurer).toHaveBeenCalled()
    })
    it('getItem', () => {
      expect(dynamoRx.getItem(<any>null) instanceof Observable).toBeTruthy()
      expect(spyValidityEnsurer).toHaveBeenCalled()
    })
    it('updateItem', () => {
      expect(dynamoRx.updateItem(<any>null) instanceof Observable).toBeTruthy()
      expect(spyValidityEnsurer).toHaveBeenCalled()
    })
    it('deleteItem', () => {
      expect(dynamoRx.deleteItem(<any>null) instanceof Observable).toBeTruthy()
      expect(spyValidityEnsurer).toHaveBeenCalled()
    })
    it('batchWriteItem', () => {
      expect(dynamoRx.batchWriteItem(<any>null) instanceof Observable).toBeTruthy()
      expect(spyValidityEnsurer).toHaveBeenCalled()
    })
    it('batchGetItems', () => {
      expect(dynamoRx.batchGetItems(<any>null) instanceof Observable).toBeTruthy()
      expect(spyValidityEnsurer).toHaveBeenCalled()
    })
    it('scan', () => {
      expect(dynamoRx.scan(<any>null) instanceof Observable).toBeTruthy()
      expect(spyValidityEnsurer).toHaveBeenCalled()
    })
    it('query', () => {
      expect(dynamoRx.query(<any>{ KeyConditionExpression: true }) instanceof Observable).toBeTruthy()
      expect(spyValidityEnsurer).toHaveBeenCalled()
    })
    it('makeRequest', () => {
      expect(dynamoRx.makeRequest(<any>null) instanceof Observable).toBeTruthy()
      expect(spyValidityEnsurer).toHaveBeenCalled()
    })
  })

  it('should update the credentials', () => {
    const dynamoRx = new DynamoRx(DEFAULT_SESSION_VALIDITY_ENSURER)
    const credentials = new Credentials({ secretAccessKey: '', sessionToken: '', accessKeyId: '' })
    dynamoRx.updateAwsConfigCredentials(new Config({ credentials }))
    expect(dynamoRx.dynamoDb.config.credentials).toBe(credentials)
  })

  xit('should use the given aws region', () => {})

})
