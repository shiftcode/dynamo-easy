import { EMPTY } from 'rxjs'
import { updateDynamoEasyConfig } from '../config'
// tslint:disable:max-classes-per-file
// tslint:disable:no-unnecessary-class
// tslint:disable:no-unused-expression
import { Model } from '../decorator/impl'
import { DEFAULT_TABLE_NAME_RESOLVER } from './default-table-name-resolver.const'
import { DynamoStore } from './dynamo-store'

@Model()
class DynamoStoreModel {}

@Model({ tableName: 'myTableName' })
class DynamoStoreModel2 {}

describe('dynamo store', () => {

  describe('table name', () => {
    it('correct table name - default', () => {
      const dynamoStore = new DynamoStore(DynamoStoreModel)
      expect(dynamoStore.tableName).toBe('dynamo-store-models')
    })

    it('correct table name - by decorator', () => {
      const dynamoStore = new DynamoStore(DynamoStoreModel2)
      expect(dynamoStore.tableName).toBe('myTableName')
    })

    it('correct table name - by tableNameResolver', () => {
      const dynamoStore = new DynamoStore(DynamoStoreModel2, tableName => `${tableName}-with-special-thing`)
      expect(dynamoStore.tableName).toBe('myTableName-with-special-thing')
    })

    it('throw error because table name is invalid', () => {
      // tslint:disable-next-line:no-unused-expression
      expect(() => new DynamoStore(DynamoStoreModel2, tableName => `${tableName}$`)).toThrowError()
    })
  })

  describe('session validity ensurer', () => {
    let validityEnsurerSpy: jasmine.Spy
    beforeEach(() => {
      validityEnsurerSpy = jasmine.createSpy().and.returnValue(EMPTY)
    })
    it('custom session validity ensurer is used', async () => {
      const store = new DynamoStore(DynamoStoreModel, DEFAULT_TABLE_NAME_RESOLVER, validityEnsurerSpy)
      await store.scan().exec().toPromise()
      expect(validityEnsurerSpy).toHaveBeenCalled()
    })
  })

  describe('logger', () => {
    let logReceiverSpy: jasmine.Spy
    beforeEach(() => {
      logReceiverSpy = jasmine.createSpy()
      updateDynamoEasyConfig({ logReceiver: logReceiverSpy })
    })
    it('logs when instance was created', () => {
      new DynamoStore(DynamoStoreModel)
      expect(logReceiverSpy).toHaveBeenCalled()
    })
  })

})
