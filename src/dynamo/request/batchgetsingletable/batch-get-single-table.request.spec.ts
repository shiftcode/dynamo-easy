import { getTableName } from '../../../../test/helper'
import { Organization } from '../../../../test/models'
import { BatchGetSingleTableRequest } from './batch-get-single-table.request'

describe('batch get', () => {
  describe('correct params', () => {
    it('simple primary key', () => {
      const request = new BatchGetSingleTableRequest<any>(<any>null, Organization, getTableName(Organization), [
        'myId',
        'myId2',
      ])
      expect(request.params.RequestItems).toBeDefined()
      expect(request.params.RequestItems).toEqual({
        Organization: { Keys: [{ id: { S: 'myId' } }, { id: { S: 'myId2' } }] },
      })
    })

    it('composite primary key', () => {
      const keys = [{ partitionKey: 'myId', sortKey: 23 }]
      const request = new BatchGetSingleTableRequest<any>(<any>null, Organization, getTableName(Organization), keys)

      expect(request.params.RequestItems).toBeDefined()
      expect(request.params.RequestItems).toEqual({
        Organization: {
          Keys: [
            {
              id: { S: 'myId' },
              createdAtDate: { N: '23' },
            },
          ],
        },
      })
    })
  })
})
