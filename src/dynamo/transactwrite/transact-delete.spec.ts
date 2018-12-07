import { UpdateModel } from '../../../test/models'
import { Metadata, metadataForClass } from '../../decorator/metadata'
import { createKeyAttributes } from '../create-ket-attributes.function'
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
