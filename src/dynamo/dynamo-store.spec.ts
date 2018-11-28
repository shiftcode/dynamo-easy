// tslint:disable:max-classes-per-file
// tslint:disable:no-unnecessary-class
import { Model } from '../decorator/impl'
import { DynamoStore } from './dynamo-store'

@Model()
class DynamoStoreModel {}

@Model({ tableName: 'myTableName' })
class DynamoStoreModel2 {}

describe('dynamo store', () => {
  describe('table name', () => {
    it('correct table name (default)', () => {
      const dynamoStore = new DynamoStore(DynamoStoreModel)

      expect(dynamoStore.tableName).toBe('dynamo-store-models')
    })

    it('correct table name ()', () => {
      const dynamoStore = new DynamoStore(DynamoStoreModel2)

      expect(dynamoStore.tableName).toBe('myTableName')
    })

    it('correct table name ()', () => {
      const dynamoStore = new DynamoStore(DynamoStoreModel2, tableName => `${tableName}-with-special-thing`)

      expect(dynamoStore.tableName).toBe('myTableName-with-special-thing')
    })

    it('throw error because table name is invalid', () => {
      expect(() => {
        // tslint:disable-next-line:no-unused-expression
        new DynamoStore(DynamoStoreModel2, tableName => `${tableName}$`)
      }).toThrowError()
    })
  })
})
