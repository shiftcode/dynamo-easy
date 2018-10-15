import * as moment from 'moment'
import { of } from 'rxjs'
import { getTableName } from '../../../../test/helper/get-table-name.function'
import { Organization } from '../../../../test/models/organization.model'
import { DEFAULT_SESSION_VALIDITY_ENSURER } from '../../default-session-validity-ensurer.const'
import { DynamoRx } from '../../dynamo-rx'
import { BatchWriteManyRequest } from './batch-write-many.request'

describe('batch write many', () => {
  const tableName = getTableName(Organization)

  let item: Organization
  let dynamoRx: DynamoRx
  let request: BatchWriteManyRequest<Organization>

  beforeEach(() => {
    item = <any>{
      id: 'myId',
      createdAtDate: moment(),
      name: 'myOrg',
    }
    dynamoRx = new DynamoRx(DEFAULT_SESSION_VALIDITY_ENSURER)
    spyOn(dynamoRx, 'batchWriteItem').and.returnValue(of({}))
    request = new BatchWriteManyRequest(dynamoRx, Organization, tableName)
  })

  describe('correct params', () => {
    it('delete with complex primary key', async () => {
      request.delete([item])
      await request.exec().toPromise()

      expect(dynamoRx.batchWriteItem).toHaveBeenCalledTimes(1)
      expect(dynamoRx.batchWriteItem).toHaveBeenCalledWith({
        RequestItems: {
          [tableName]: [
            {
              DeleteRequest: {
                Key: {
                  id: { S: 'myId' },
                  createdAtDate: { S: item.createdAtDate.utc().format() },
                },
              },
            },
          ],
        },
      })
    })

    it('put object', async () => {
      request.put([item])
      await request.exec().toPromise()

      expect(dynamoRx.batchWriteItem).toHaveBeenCalledTimes(1)
      expect(dynamoRx.batchWriteItem).toHaveBeenCalledWith({
        RequestItems: {
          [tableName]: [
            {
              PutRequest: {
                Item: {
                  id: { S: 'myId' },
                  createdAtDate: { S: item.createdAtDate.utc().format() },
                  name: { S: 'myOrg' },
                },
              },
            },
          ],
        },
      })
    })

    it('delete >25 items in two requests', async () => {
      const twentyFiveItems = []
      for (let i = 0; i < 25; i++) {
        twentyFiveItems.push(item)
      }
      request.delete(twentyFiveItems)
      request.delete(twentyFiveItems)
      await request.exec().toPromise()

      expect(dynamoRx.batchWriteItem).toHaveBeenCalledTimes(2)
    })
  })
})
