import * as DynamoDB from 'aws-sdk/clients/dynamodb'
import { SimpleWithPartitionKeyModel } from '../../../../test/models'
import { metadataForClass } from '../../../decorator/metadata'
import { createKeyAttributes } from '../../../mapper'
import { DynamoRx } from '../../dynamo-rx'
import { getTableName } from '../../get-table-name.function'
import { TransactGetSingleTableRequest } from './transact-get-single-table.request'

describe('TransactGetSingleTableRequest', () => {
  let req: TransactGetSingleTableRequest<any>

  const simpleWithPartitionKeyMeta = metadataForClass(SimpleWithPartitionKeyModel)

  describe('params', () => {
    it('should add Get item with tableName and key to params.TransactItems', () => {
      req = new TransactGetSingleTableRequest(<any>null, SimpleWithPartitionKeyModel, [{ id: 'myId' }])

      expect(req.params.TransactItems).toBeDefined()
      expect(req.params.TransactItems.length).toBe(1)
      expect(req.params.TransactItems[0].Get).toBeDefined()
      expect(req.params.TransactItems[0].Get.TableName).toEqual(getTableName(SimpleWithPartitionKeyModel))
      expect(req.params.TransactItems[0].Get.Key).toEqual(createKeyAttributes(simpleWithPartitionKeyMeta, 'myId'))
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
    let transactGetItemsSpy = jasmine.createSpy().and.returnValue(Promise.resolve(response))

    beforeEach(() => {
      const dynamoRxMock: DynamoRx = <any>{ transactGetItems: transactGetItemsSpy }
      req = new TransactGetSingleTableRequest(dynamoRxMock, SimpleWithPartitionKeyModel, [{ id: 'myId' }])
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
})
