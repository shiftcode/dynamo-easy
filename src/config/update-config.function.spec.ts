// tslint:disable:no-empty

import { resetDynamoEasyConfig } from '../../test/helper/resetDynamoEasyConfig.function'
import { DateToNumberMapper } from '../mapper/custom'
import { dynamoEasyConfig } from './dynamo-easy-config'
import { updateDynamoEasyConfig } from './update-config.function'

describe('updateDynamoEasyConfig', () => {
  afterEach(resetDynamoEasyConfig)

  it('should throw when providing invalid stuff', () => {
    expect(() => updateDynamoEasyConfig({ logReceiver: <any>null })).toThrow()
    expect(() => updateDynamoEasyConfig({ dateMapper: <any>null })).toThrow()
  })

  it('should have defaults', () => {
    expect(dynamoEasyConfig.logReceiver).toBeDefined()
    expect(dynamoEasyConfig.dateMapper).toBeDefined()
  })

  it('should work when providing valid stuff', () => {
    const myLogReceiver = () => {}
    const myDateMapper = { ...DateToNumberMapper }
    updateDynamoEasyConfig({
      logReceiver: myLogReceiver,
      dateMapper: myDateMapper,
    })
    expect(dynamoEasyConfig.logReceiver).toBe(myLogReceiver)
    expect(dynamoEasyConfig.dateMapper).toBe(myDateMapper)
  })
})
