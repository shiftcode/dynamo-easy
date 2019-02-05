import { Organization } from '../../../test/models'
import { ModelConstructor } from '../../model/model-constructor'
import { getTableName } from '../get-table-name.function'
import { StandardRequest } from './standard.request'

describe('StandardRequest', () => {
  class MyStandardRequest<T> extends StandardRequest<T, any, MyStandardRequest<T>> {
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

  it('adds table name to params', () => {
    const msr = new MyStandardRequest(Organization)
    expect(msr.params.TableName).toEqual(getTableName(Organization))
  })
})
