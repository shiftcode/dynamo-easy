import { of } from 'rxjs'
import { Organization } from '../../../test/models'
import { ModelConstructor } from '../../model'
import { getTableName } from '../get-table-name.function'
import { StandardRequest } from './standard.request'

describe('StandardRequest', () => {
  class MyStandardRequest<T> extends StandardRequest<T, any> {
    constructor(c: ModelConstructor<T>) {
      super(<any>null, c)
    }

    exec() {
      return of([])
    }

    execFullResponse() {
      return of({})
    }
  }

  it('adds table name to params', () => {
    const msr = new MyStandardRequest(Organization)
    expect(msr.params.TableName).toEqual(getTableName(Organization))
  })
})
