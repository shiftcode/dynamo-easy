import * as DynamoDB from 'aws-sdk/clients/dynamodb'
import { of } from 'rxjs'
import { getTableName } from '../../../test/helper'
import { SimpleWithCompositePartitionKeyModel, SimpleWithPartitionKeyModel } from '../../../test/models'
import { Organization } from '../../../test/models/organization.model'
import { Attributes } from '../../mapper'
import { DynamoRx } from '../dynamo-rx'
import { BatchGetRequest } from './batch-get.request'

describe('batch get', () => {
  let request: BatchGetRequest


  describe('params', () => {

    beforeEach(() => request = new BatchGetRequest())

    it('base params', () => {
      const params = request.params
      expect(params).toEqual({ RequestItems: {} })
    })

    it('key', () => {
      request.forModel(Organization, ['idValue'])
      const params = request.params
      expect(params.RequestItems).toBeDefined()
      expect(params.RequestItems.Organization).toBeDefined()
      expect(params.RequestItems.Organization).toEqual({ Keys: [{ id: { S: 'idValue' } }] })
    })
  })


  describe('forModel', () => {
    beforeEach(() => request = new BatchGetRequest())

    it('should throw when same table is used 2 times', () => {
      request.forModel(SimpleWithPartitionKeyModel, ['idVal'])
      expect(() => request.forModel(SimpleWithPartitionKeyModel, ['otherVal'])).toThrow()
    })

    it('should throw when providing null value ', () => {
      expect(() => request.forModel(SimpleWithPartitionKeyModel, [<any>null])).toThrow()
    })

    it('should throw when sortKey is missing', () => {
      expect(() => request.forModel(SimpleWithCompositePartitionKeyModel, [{ partitionKey: 'idVal' }]))
    })

    it('should throw when partitionKey is neither string nor object', () => {
      expect(() => request.forModel(SimpleWithCompositePartitionKeyModel, [<any>78]))
      expect(() => request.forModel(SimpleWithCompositePartitionKeyModel, [<any>true]))
      expect(() => request.forModel(SimpleWithCompositePartitionKeyModel, [<any>new Date()]))
    })

  })


  describe('should map the result items', () => {
    let batchGetItemsSpy: jasmine.Spy
    const jsItem: SimpleWithPartitionKeyModel = { id: 'idVal', age: 20 }
    const dbItem: Attributes<SimpleWithPartitionKeyModel> = {
      id: { S: 'idVal' },
      age: { N: '20' },
    }
    const sampleResponse: DynamoDB.BatchGetItemOutput = {
      Responses: {
        [getTableName(SimpleWithPartitionKeyModel)]: [dbItem],
      },
      UnprocessedKeys: {},
    }

    beforeEach(() => {
      batchGetItemsSpy = jasmine.createSpy().and.returnValue(of(sampleResponse))
      const dynamoRx: DynamoRx = <any>{ batchGetItems: batchGetItemsSpy }
      request = new BatchGetRequest()
      Object.assign(request, { dynamoRx })
      request.forModel(SimpleWithPartitionKeyModel, ['idVal'])
    })

    it('exec', async () => {
      const result = await request.exec().toPromise()
      expect(batchGetItemsSpy).toHaveBeenCalled()
      expect(result).toEqual({ [getTableName(SimpleWithPartitionKeyModel)]: [jsItem] })
    })

    it('execFullResponse', async () => {
      const result = await request.execFullResponse().toPromise()
      expect(batchGetItemsSpy).toHaveBeenCalled()
      expect(result).toEqual({
        Responses: { [getTableName(SimpleWithPartitionKeyModel)]: [jsItem] },
        UnprocessedKeys: {},
      })
    })

  })

})
