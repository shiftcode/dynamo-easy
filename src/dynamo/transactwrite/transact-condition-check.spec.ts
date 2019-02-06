import { UpdateModel } from '../../../test/models'
import { Metadata } from '../../decorator/metadata/metadata'
import { metadataForModel } from '../../decorator/metadata/metadata-helper'
import { createKeyAttributes } from '../../mapper/mapper'
import { getTableName } from '../get-table-name.function'
import { TransactConditionCheck } from './transact-condition-check'

describe('TransactConditionCheck', () => {
  let op: TransactConditionCheck<UpdateModel>
  let metadata: Metadata<UpdateModel>
  beforeEach(() => {
    op = new TransactConditionCheck(UpdateModel, 'myId')
    metadata = metadataForModel(UpdateModel)
  })

  it('correct transactItem', () => {
    op.onlyIfAttribute('name').eq('Foo Bar')
    expect(op.transactItem).toEqual({
      ConditionCheck: {
        TableName: getTableName(UpdateModel),
        Key: createKeyAttributes(metadata, 'myId'),
        ConditionExpression: '#name = :name',
        ExpressionAttributeNames: { '#name': 'name' },
        ExpressionAttributeValues: { ':name': { S: 'Foo Bar' } },
      },
    })
  })
})
