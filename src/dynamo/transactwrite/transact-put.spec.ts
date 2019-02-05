import { UpdateModel } from '../../../test/models'
import { toDb } from '../../mapper/mapper'
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
      topics: new Set(['Table-Tennis']),
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

  it('ifNotExists should do nothing when predicate is falsy', () => {
    op.ifNotExists(false)
    expect(op.params).toEqual({
      TableName: getTableName(UpdateModel),
      Item: toDb(item, UpdateModel),
    })
  })

  it('ifNotExists should add param when predicate is truthy (default)', () => {
    op.ifNotExists()
    expect(op.params).toEqual({
      TableName: getTableName(UpdateModel),
      Item: toDb(item, UpdateModel),
      ConditionExpression: '(attribute_not_exists (#id))',
      ExpressionAttributeNames: { '#id': 'id' },
    })
  })
})
