import { UpdateModel } from '../../../test/models'
import { Metadata } from '../../decorator/metadata/metadata'
import { metadataForClass } from '../../decorator/metadata/metadata-helper'
import { createKeyAttributes } from '../../mapper/mapper'
import { getTableName } from '../get-table-name.function'
import { TransactDelete } from './transact-delete'

describe('TransactDelete', () => {
  let op: TransactDelete<UpdateModel>
  let metadata: Metadata<UpdateModel>
  beforeEach(() => {
    op = new TransactDelete(UpdateModel, 'myId')
    metadata = metadataForClass(UpdateModel)
  })

  it('correct transactItem', () => {
    op.onlyIfAttribute('name').eq('Foo Bar')
    expect(op.transactItem).toEqual({
      Delete: {
        TableName: getTableName(UpdateModel),
        Key: createKeyAttributes(metadata, 'myId'),
        ConditionExpression: '#name = :name',
        ExpressionAttributeNames: { '#name': 'name' },
        ExpressionAttributeValues: { ':name': { S: 'Foo Bar' } },
      },
    })
  })
})
