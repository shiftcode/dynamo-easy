/* eslint-disable max-classes-per-file, @typescript-eslint/no-extraneous-class */
import * as DynamoDB from 'aws-sdk/clients/dynamodb'
import { resetDynamoEasyConfig } from '../../test/helper/resetDynamoEasyConfig.function'
import { SimpleWithPartitionKeyModel } from '../../test/models'
import { updateDynamoEasyConfig } from '../config/update-config.function'
import { Model } from '../decorator/impl/model/model.decorator'
import { DynamoStore } from './dynamo-store'
import { BatchGetSingleTableRequest } from './request/batchgetsingletable/batch-get-single-table.request'
import { BatchWriteSingleTableRequest } from './request/batchwritesingletable/batch-write-single-table.request'
import { DeleteRequest } from './request/delete/delete.request'
import { GetRequest } from './request/get/get.request'
import { PutRequest } from './request/put/put.request'
import { QueryRequest } from './request/query/query.request'
import { ScanRequest } from './request/scan/scan.request'
import { TransactGetSingleTableRequest } from './request/transactgetsingletable/transact-get-single-table.request'
import { UpdateRequest } from './request/update/update.request'

@Model()
class DynamoStoreModel {}

@Model({ tableName: 'myTableName' })
class DynamoStoreModel2 {}

describe('dynamo store', () => {
  describe('table name', () => {
    it('correct table name', () => {
      const store = new DynamoStore(DynamoStoreModel2)
      expect(store.tableName).toBe('myTableName')
    })
  })

  describe('session validity ensurer', () => {
    let validityEnsurerSpy: jasmine.Spy

    beforeEach(() => {
      // Promise.reject to not reach the actual call to the aws sdk
      validityEnsurerSpy = jasmine.createSpy().and.returnValue(Promise.reject())
      updateDynamoEasyConfig({ sessionValidityEnsurer: validityEnsurerSpy })
    })

    afterEach(resetDynamoEasyConfig)

    it('custom session validity ensurer is used', async () => {
      const store = new DynamoStore(DynamoStoreModel)
      try {
        await store.scan().exec()
      } catch (error) {
        // ignore
      }
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

  describe('should create request objects', () => {
    let store: DynamoStore<SimpleWithPartitionKeyModel>

    beforeEach(() => {
      store = new DynamoStore(SimpleWithPartitionKeyModel)
    })

    it('put', () => expect(store.put({ id: 'id', age: 0 }) instanceof PutRequest).toBeTruthy())
    it('get', () => expect(store.get('id') instanceof GetRequest).toBeTruthy())
    it('update', () => expect(store.update('id') instanceof UpdateRequest).toBeTruthy())
    it('delete', () => expect(store.delete('id') instanceof DeleteRequest).toBeTruthy())
    it('batchWrite', () => expect(store.batchWrite() instanceof BatchWriteSingleTableRequest).toBeTruthy())
    it('scan', () => expect(store.scan() instanceof ScanRequest).toBeTruthy())
    it('query', () => expect(store.query() instanceof QueryRequest).toBeTruthy())
    it('batchGet', () => expect(store.batchGet([{ id: 'id' }]) instanceof BatchGetSingleTableRequest).toBeTruthy())
    it('transactGet', () =>
      expect(store.transactGet([{ id: 'myId' }]) instanceof TransactGetSingleTableRequest).toBeTruthy())
  })

  describe('should enable custom requests', () => {
    const makeRequestSpy = jasmine.createSpy().and.returnValue(Promise.resolve())
    const store = new DynamoStore(SimpleWithPartitionKeyModel)
    Object.assign(store, { dynamoDBWrapper: { makeRequest: makeRequestSpy } })
    store.makeRequest('updateTimeToLive', {})
    expect(makeRequestSpy).toBeCalled()
  })

  describe('allow to get dynamoDB instance', () => {
    const store = new DynamoStore(SimpleWithPartitionKeyModel)
    expect(store.dynamoDB).toBeDefined()
  })

  describe('use provided dynamoDB instance', () => {
    const dynamoDB = new DynamoDB()
    const store = new DynamoStore(SimpleWithPartitionKeyModel, dynamoDB)
    expect(store.dynamoDB).toBe(dynamoDB)

    const store2 = new DynamoStore(SimpleWithPartitionKeyModel)
    expect(store2.dynamoDB).not.toBe(dynamoDB)
  })
})
