import moment from 'moment-es6'
import { getTableName } from '../../../../test/helper/get-table-name.function'
import { ComplexModel } from '../../../../test/models/complex.model'
import { SimpleWithIdModel } from '../../../../test/models/simple-with-id.model'
import { MetadataHelper } from '../../../decorator/metadata/metadata-helper'
import { ModelConstructor } from '../../../model/model-constructor'
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
    const request = new DeleteRequest(<any>null, SimpleWithIdModel, getTableName(SimpleWithIdModel), 'myId')
    const key = request.params.Key
    expect(key).toBeDefined()
    expect(Object.keys(key).length).toBe(1)

    expect(key['id']).toBeDefined()
    expect(key['id']).toEqual({ S: 'myId' })
  })

  it('should throw for no sort key value', () => {
    expect(() => {
      const request = new DeleteRequest(<any>null, ComplexModel, getTableName(ComplexModel), 'partitionValue')
    }).toThrowError()
  })
})
