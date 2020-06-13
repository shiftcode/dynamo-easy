import { resetDynamoEasyConfig } from '../../test/helper/resetDynamoEasyConfig.function'
import { dateToNumberMapper } from '../mapper/custom/date-to-number.mapper'
import { dynamoEasyConfig } from './dynamo-easy-config'
import { updateDynamoEasyConfig } from './update-config.function'

describe('updateDynamoEasyConfig', () => {
  afterEach(resetDynamoEasyConfig)

  it('should have defaults', () => {
    expect(dynamoEasyConfig.logReceiver).toBeDefined()
    expect(dynamoEasyConfig.dateMapper).toBeDefined()
    expect(dynamoEasyConfig.tableNameResolver).toBeDefined()
    expect(dynamoEasyConfig.sessionValidityEnsurer).toBeDefined()
  })

  it('should throw when providing explicitly undefined, null, or a non-function value', () => {
    expect(() => updateDynamoEasyConfig({ logReceiver: undefined })).toThrow()
    expect(() => updateDynamoEasyConfig({ logReceiver: <any>null })).toThrow()
    expect(() => updateDynamoEasyConfig({ logReceiver: <any>'foo' })).toThrow()

    expect(() => updateDynamoEasyConfig({ dateMapper: undefined })).toThrow()
    expect(() => updateDynamoEasyConfig({ dateMapper: <any>null })).toThrow()
    expect(() => updateDynamoEasyConfig({ dateMapper: <any>'foo' })).toThrow()

    expect(() => updateDynamoEasyConfig({ tableNameResolver: undefined })).toThrow()
    expect(() => updateDynamoEasyConfig({ tableNameResolver: <any>null })).toThrow()
    expect(() => updateDynamoEasyConfig({ tableNameResolver: <any>'foo' })).toThrow()

    expect(() => updateDynamoEasyConfig({ sessionValidityEnsurer: undefined })).toThrow()
    expect(() => updateDynamoEasyConfig({ sessionValidityEnsurer: <any>null })).toThrow()
    expect(() => updateDynamoEasyConfig({ sessionValidityEnsurer: <any>'foo' })).toThrow()
  })

  it('should not override default when updating but not providing a value', () => {
    updateDynamoEasyConfig({})
    expect(dynamoEasyConfig.logReceiver).toBeDefined()
    expect(dynamoEasyConfig.dateMapper).toBeDefined()
    expect(dynamoEasyConfig.tableNameResolver).toBeDefined()
    expect(dynamoEasyConfig.sessionValidityEnsurer).toBeDefined()
  })

  it('should work when providing valid stuff', () => {
    /* eslint-disable-next-line  @typescript-eslint/no-empty-function */
    const myLogReceiver = () => {}
    const myDateMapper = { ...dateToNumberMapper }
    updateDynamoEasyConfig({
      logReceiver: myLogReceiver,
      dateMapper: myDateMapper,
    })
    expect(dynamoEasyConfig.logReceiver).toBe(myLogReceiver)
    expect(dynamoEasyConfig.dateMapper).toBe(myDateMapper)
  })
})
