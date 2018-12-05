import { UpdateModel } from '../../../test/models'
import { toDb } from '../../mapper'
import { getTableName } from '../get-table-name.function'
import { TransactPut } from './transact-put'

describe('TransactPut', () => {
  let op: TransactPut<UpdateModel>
  let item: UpdateModel
  beforeEach(() => {
    const now = new Date()
    item = {
      id: 'myId',
      creationDate: now,
      lastUpdated: now,
      name: 'Foo Bar',
      active: true,
      counter: 10,
      addresses: [],
      numberValues: [42],
      info: { details: 'Foo Bar' },
      topics: ['Table-Tennis'],
    }
    op = new TransactPut(UpdateModel, item)
  })

  it('correct transactItem', () => {
    expect(op.transactItem).toEqual({
      Put: {
        TableName: getTableName(UpdateModel),
        Item: toDb(item, UpdateModel),
      },
    })
  })
})
