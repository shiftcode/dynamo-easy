import * as moment from 'moment'
import { getTableName } from '../../../../test/helper'
import { ComplexModel, SimpleWithPartitionKeyModel } from '../../../../test/models'
import { DeleteRequest } from './delete.request'

describe('delete request', () => {
  it('should create request with key (composite) expression', () => {
    const now = moment()
    const request = new DeleteRequest(<any>null, ComplexModel, getTableName(ComplexModel), 'partitionValue', now)
    const key = request.params.Key
    expect(key).toBeDefined()
    expect(Object.keys(key).length).toBe(2)

    expect(key['id']).toBeDefined()
    expect(key['id']).toEqual({ S: 'partitionValue' })
    expect(key['creationDate']).toBeDefined()
    expect(key['creationDate']).toEqual({
      S: now
        .clone()
        .utc()
        .format(),
    })
  })

  it('should create request with key (simple) expression', () => {
    const request = new DeleteRequest(
      <any>null,
      SimpleWithPartitionKeyModel,
      getTableName(SimpleWithPartitionKeyModel),
      'myId'
    )
    const key = request.params.Key
    expect(key).toBeDefined()
    expect(Object.keys(key).length).toBe(1)

    expect(key['id']).toBeDefined()
    expect(key['id']).toEqual({ S: 'myId' })
  })

  it('should throw for no sort key value', () => {
    expect(
      () => new DeleteRequest(<any>null, ComplexModel, getTableName(ComplexModel), 'partitionValue')
    ).toThrowError()
  })
})
