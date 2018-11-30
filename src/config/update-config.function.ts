import { Config } from './config.type'
import { dynamoEasyConfig } from './dynamo-easy-config'

export function updateDynamoEasyConfig(config: Partial<Config>): void {
  if (config.logReceiver !== undefined && typeof config.logReceiver !== 'function') {
    throw new Error('Config.logReceiver has to be a function')
  }
  if (config.dateMapper !== undefined && (config.dateMapper === null || typeof config.dateMapper.toDb !== 'function' || typeof config.dateMapper.fromDb !== 'function')) {
    throw new Error('Config.dateMapper must be an object of type MapperForType')
  }
  Object.assign(dynamoEasyConfig, config)
}
