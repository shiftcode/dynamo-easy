// tslint:disable:no-non-null-assertion
import * as DynamoDB from '@aws-sdk/client-dynamodb'
import { SimpleWithPartitionKeyModel } from '../../../../test/models'
import { metadataForModel } from '../../../decorator/metadata/metadata-for-model.function'
import { createKeyAttributes } from '../../../mapper/mapper'
import { DynamoDbWrapper } from '../../dynamo-db-wrapper'
import { getTableName } from '../../get-table-name.function'
import { TransactGetSingleTableRequest } from './transact-get-single-table.request'

describe('TransactGetSingleTableRequest', () => {
  let req: TransactGetSingleTableRequest<any>

  const simpleWithPartitionKeyMeta = metadataForModel(SimpleWithPartitionKeyModel)

  describe('params', () => {
    it('should add Get item with tableName and key to params.TransactItems', () => {
      req = new TransactGetSingleTableRequest(<any>null, SimpleWithPartitionKeyModel, [{ id: 'myId' }])

      expect(req.params.TransactItems).toBeDefined()
      expect(req.params.TransactItems?.length).toBe(1)
      expect(req.params.TransactItems?.[0]?.Get).toBeDefined()
      expect(req.params.TransactItems?.[0].Get?.TableName).toEqual(getTableName(SimpleWithPartitionKeyModel))
      expect(req.params.TransactItems?.[0].Get?.Key).toEqual(createKeyAttributes(simpleWithPartitionKeyMeta, 'myId'))
    })
  })

  describe('exec, execFullResponse', () => {
    const response: DynamoDB.TransactGetItemsOutput = {
      Responses: [
        {
          Item: { id: { S: 'myId' }, age: { N: '20' } },
        },
      ],
      ConsumedCapacity: [],
    }
    const transactGetItemsSpy = jest.fn().mockReturnValue(Promise.resolve(response))

    beforeEach(() => {
      const dynamoDBWrapperMock: DynamoDbWrapper = <any>{ transactGetItems: transactGetItemsSpy }
      req = new TransactGetSingleTableRequest(dynamoDBWrapperMock, SimpleWithPartitionKeyModel, [{ id: 'myId' }])
    })

    it('exec should map items', async () => {
      const resp = await req.exec()
      expect(resp).toBeDefined()
      expect(resp.length).toBe(1)
      expect(resp[0]).toEqual({
        id: 'myId',
        age: 20,
      })
    })

    it('execNoMap should return the raw value', async () => {
      expect(await req.execNoMap()).toEqual(response)
    })

    it('execFullResponse should map items and potentially return consumed capacity', async () => {
      const resp = await req.execFullResponse()
      expect(resp).toBeDefined()
      expect(resp.ConsumedCapacity).toEqual([])
      expect(resp.Items).toBeDefined()
      expect(resp.Items.length).toBe(1)
      expect(resp.Items[0]).toEqual({
        id: 'myId',
        age: 20,
      })
    })
  })

  describe('with empty response', () => {
    const response: DynamoDB.TransactGetItemsOutput = {}
    const transactGetItemsSpy = jest.fn().mockReturnValue(Promise.resolve(response))

    beforeEach(() => {
      const dynamoDBWrapperMock: DynamoDbWrapper = <any>{ transactGetItems: transactGetItemsSpy }
      req = new TransactGetSingleTableRequest(dynamoDBWrapperMock, SimpleWithPartitionKeyModel, [])
    })

    it('exec returns empty array', async () => {
      expect(await req.exec()).toEqual([])
    })

    it('execNoMap returns original response (empty object)', async () => {
      expect(await req.execNoMap()).toEqual({})
    })

    it('execFullResponse returns the response with empty items array', async () => {
      expect(await req.execFullResponse()).toEqual({
        ConsumedCapacity: undefined,
        Items: [],
      })
    })
  })
})
