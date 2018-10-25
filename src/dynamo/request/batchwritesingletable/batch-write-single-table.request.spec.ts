import * as DynamoDB from 'aws-sdk/clients/dynamodb'
import * as moment from 'moment'
import { of } from 'rxjs'
import { getTableName } from '../../../../test/helper/get-table-name.function'
import { Organization } from '../../../../test/models/organization.model'
import { DEFAULT_SESSION_VALIDITY_ENSURER } from '../../default-session-validity-ensurer.const'
import { DynamoRx } from '../../dynamo-rx'
import { BatchWriteSingleTableRequest } from './batch-write-single-table.request'

describe('batch write single table request', () => {
  const tableName = getTableName(Organization)

  let item: Organization
  let dynamoRx: DynamoRx
  let request: BatchWriteSingleTableRequest<Organization>

  let nextSpyFn: () => { value: number }
  const generatorMock = () => <any>{ next: nextSpyFn }

  beforeEach(() => {
    item = <any>{
      id: 'myId',
      createdAtDate: moment(),
      name: 'myOrg',
    }
    nextSpyFn = jest.fn().mockImplementation(() => ({ value: 0 }))
  })

  describe('correct params', () => {
    beforeEach(() => {
      dynamoRx = new DynamoRx(DEFAULT_SESSION_VALIDITY_ENSURER)
      request = new BatchWriteSingleTableRequest(dynamoRx, Organization, tableName)

      const output: DynamoDB.BatchWriteItemOutput = {}
      spyOn(dynamoRx, 'batchWriteItem').and.returnValue(of(output))
    })

    it('delete with complex primary key', async () => {
      request.delete([item])
      await request.exec(generatorMock).toPromise()

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
      expect(nextSpyFn).toHaveBeenCalledTimes(0)
    })

    it('put object', async () => {
      request.put([item])
      await request.exec(generatorMock).toPromise()

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
      expect(nextSpyFn).toHaveBeenCalledTimes(0)
    })

    it('delete >25 items in two requests', async () => {
      const twentyFiveItems = []
      for (let i = 0; i < 25; i++) {
        twentyFiveItems.push(item)
      }
      request.delete(twentyFiveItems)
      request.delete(twentyFiveItems)
      await request.exec(generatorMock).toPromise()
      expect(dynamoRx.batchWriteItem).toHaveBeenCalledTimes(2)
      expect(nextSpyFn).toHaveBeenCalledTimes(0)
    })
  })

  describe('correct backoff', () => {
    beforeEach(() => {
      dynamoRx = new DynamoRx(DEFAULT_SESSION_VALIDITY_ENSURER)
      request = new BatchWriteSingleTableRequest(dynamoRx, Organization, tableName)

      const output: DynamoDB.BatchWriteItemOutput = {
        UnprocessedItems: {
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
      }
      spyOn(dynamoRx, 'batchWriteItem').and.returnValues(of(output), of({}))
    })

    it('should retry when capacity is exceeded', async () => {
      request.put([item])
      await request.exec(generatorMock).toPromise()
      expect(dynamoRx.batchWriteItem).toHaveBeenCalledTimes(2)
      expect(nextSpyFn).toHaveBeenCalledTimes(1)
    })
  })
})
