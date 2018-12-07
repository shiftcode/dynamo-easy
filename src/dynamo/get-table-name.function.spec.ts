import { resetDynamoEasyConfig } from '../../test/helper/resetDynamoEasyConfig.function'
import { Organization, SimpleModel } from '../../test/models'
import { updateDynamoEasyConfig } from '../config'
import { metadataForClass } from '../decorator/metadata'
import { getTableName } from './get-table-name.function'

describe('getTableName', () => {
  afterEach(resetDynamoEasyConfig)

  it('correct table name - default by class', () => {
    expect(getTableName(SimpleModel)).toBe('simple-models')
  })

  it('correct table name - default by metaData', () => {
    expect(getTableName(metadataForClass(SimpleModel))).toBe('simple-models')
  })

  it('correct table name - by decorator', () => {
    expect(getTableName(Organization)).toBe('Organization')
  })

  it('correct table name - by tableNameResolver', () => {
    updateDynamoEasyConfig({ tableNameResolver: tableName => `${tableName}-with-special-thing` })
    expect(getTableName(SimpleModel)).toBe('simple-models-with-special-thing')
    expect(getTableName(metadataForClass(Organization))).toBe('Organization-with-special-thing')
  })

  it('throw error because table name is invalid', () => {
    // tslint:disable-next-line:no-unused-expression
    updateDynamoEasyConfig({ tableNameResolver: tableName => `${tableName}$` })
    expect(() => getTableName(metadataForClass(SimpleModel))).toThrowError()
    expect(() => getTableName(Organization)).toThrowError()
  })
})
