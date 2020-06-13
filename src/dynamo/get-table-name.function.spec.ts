import { resetDynamoEasyConfig } from '../../test/helper/resetDynamoEasyConfig.function'
import { Organization, SimpleModel } from '../../test/models'
import { updateDynamoEasyConfig } from '../config/update-config.function'
import { metadataForModel } from '../decorator/metadata/metadata-for-model.function'
import { getTableName } from './get-table-name.function'

describe('getTableName', () => {
  afterEach(resetDynamoEasyConfig)

  it('correct table name - default by class', () => {
    expect(getTableName(SimpleModel)).toBe('simple-models')
  })

  it('correct table name - default by metaData', () => {
    expect(getTableName(metadataForModel(SimpleModel))).toBe('simple-models')
  })

  it('correct table name - by decorator', () => {
    expect(getTableName(Organization)).toBe('Organization')
  })

  it('correct table name - by tableNameResolver', () => {
    updateDynamoEasyConfig({ tableNameResolver: (tableName) => `${tableName}-with-special-thing` })
    expect(getTableName(SimpleModel)).toBe('simple-models-with-special-thing')
    expect(getTableName(metadataForModel(Organization))).toBe('Organization-with-special-thing')
  })

  it('throw error because table name is invalid', () => {
    updateDynamoEasyConfig({ tableNameResolver: (tableName) => `${tableName}$` })
    expect(() => getTableName(metadataForModel(SimpleModel))).toThrowError()
    expect(() => getTableName(Organization)).toThrowError()
  })
})
