import { UpdateModel } from '../../../test/models'
import { Metadata, metadataForClass } from '../../decorator/metadata'
import { createKeyAttributes } from '../../mapper'
import { update } from '../expression/logical-operator/update.function'
import { getTableName } from '../get-table-name.function'
import { TransactUpdate } from './transact-update'

describe('TransactUpdate', () => {
  let op: TransactUpdate<UpdateModel>
  let metadata: Metadata<UpdateModel>
  beforeEach(() => {
    op = new TransactUpdate(UpdateModel, 'myId')
    metadata = metadataForClass(UpdateModel)
  })

  it('correct transactItem', () => {
    const now = new Date()
    op.operations(update<UpdateModel>('lastUpdated').set(now))
    op.onlyIfAttribute('name').eq('Foo Bar')

    expect(op.transactItem).toEqual({
      Update: {
        TableName: getTableName(UpdateModel),
        Key: createKeyAttributes(metadata, 'myId'),

        UpdateExpression: 'SET #lastUpdated = :lastUpdated',
        ConditionExpression: '#name = :name',

        ExpressionAttributeNames: {
          '#lastUpdated': 'lastUpdated',
          '#name': 'name',
        },
        ExpressionAttributeValues: {
          ':lastUpdated': { S: now.toISOString() },
          ':name': { S: 'Foo Bar' },
        },
      },
    })
  })
})
