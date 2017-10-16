import { BatchGetPartitionValueList } from 'aws-sdk/clients/glue'
import * as moment from 'moment'
import { getTableName } from '../../../../test/helper/get-table-name.function'
import { Organization } from '../../../../test/models/organization.model'
import { BatchGetSingleTableRequest } from './batch-get-single-table.request'

describe('batch get', () => {
  describe('correct params', () => {
    it('simple primary key', () => {
      const request = new BatchGetSingleTableRequest<any>(null, Organization, getTableName(Organization), [
        'myId',
        'myId2',
      ])
      expect(request.params.RequestItems).toBeDefined()
      expect(request.params.RequestItems).toEqual({
        Organization: { Keys: [{ id: { S: 'myId' } }, { id: { S: 'myId2' } }] },
      })
    })

    it('composite primary key', () => {
      const now = moment()
      const keys = [{ partitionKey: 'myId', sortKey: now }]
      const request = new BatchGetSingleTableRequest<any>(null, Organization, getTableName(Organization), keys)

      expect(request.params.RequestItems).toBeDefined()
      expect(request.params.RequestItems).toEqual({
        Organization: {
          Keys: [
            {
              id: { S: 'myId' },
              createdAtDate: {
                S: now
                  .clone()
                  .utc()
                  .format(),
              },
            },
          ],
        },
      })
    })
  })
})
