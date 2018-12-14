import { UpdateModel } from '../../../test/models'
import { Metadata, metadataForClass } from '../../decorator/metadata'
import { createKeyAttributes } from '../../mapper'
import { getTableName } from '../get-table-name.function'
import { TransactConditionCheck } from './transact-condition-check'

describe('TransactConditionCheck', () => {
  let op: TransactConditionCheck<UpdateModel>
  let metadata: Metadata<UpdateModel>
  beforeEach(() => {
    op = new TransactConditionCheck(UpdateModel, 'myId')
    metadata = metadataForClass(UpdateModel)
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
