import { Organization } from '../../../test/models'
import { ModelConstructor } from '../../model/model-constructor'
import { getTableName } from '../get-table-name.function'
import { StandardRequest } from './standard.request'

describe('StandardRequest', () => {
  class MyStandardRequest<T> extends StandardRequest<T, T, any, MyStandardRequest<T>> {
    constructor(c: ModelConstructor<T>) {
      super(<any>null, c)
    }

    exec() {
      return Promise.resolve([])
    }

    execFullResponse() {
      return Promise.resolve({})
    }
  }

  it('creates default params with table name', () => {
    const msr = new MyStandardRequest(Organization)
    expect(msr.params).toEqual({ TableName: getTableName(Organization) })
  })
})
