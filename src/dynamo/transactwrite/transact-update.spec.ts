import { UpdateModel } from '../../../test/models'
import { Metadata } from '../../decorator/metadata/metadata'
import { metadataForModel } from '../../decorator/metadata/metadata-for-model.function'
import { createKeyAttributes } from '../../mapper/mapper'
import { update2 } from '../expression/logical-operator/update.function'
import { getTableName } from '../get-table-name.function'
import { TransactUpdate } from './transact-update'

describe('TransactUpdate', () => {
  let op: TransactUpdate<UpdateModel>
  let metadata: Metadata<UpdateModel>
  let now: Date
  beforeEach(() => {
    op = new TransactUpdate(UpdateModel, 'myId')
    now = new Date()
    metadata = metadataForModel(UpdateModel)
  })

  afterEach(() => {
    expect(op.transactItem).toEqual({
      Update: {
        TableName: getTableName(UpdateModel),
        Key: createKeyAttributes(metadata, 'myId'),

        UpdateExpression: 'SET #lastUpdated = if_not_exists(#lastUpdated, :lastUpdated)',
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

  it('correct transactItem [operations]', () => {
    op.operations(update2(UpdateModel, 'lastUpdated').set(now, true)).onlyIfAttribute('name').eq('Foo Bar')
  })

  it('correct transactItem [updateAttribute]', () => {
    op.updateAttribute('lastUpdated').set(now, true).onlyIfAttribute('name').eq('Foo Bar')
  })
})
