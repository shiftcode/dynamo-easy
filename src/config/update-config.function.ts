import { Config } from './config.type'
import { dynamoEasyConfig } from './dynamo-easy-config'

export function updateDynamoEasyConfig(config: Partial<Config>): void {
  if (config.logReceiver !== undefined && typeof config.logReceiver !== 'function') {
    throw new Error('Config.logReceiver has to be a function')
  }
  Object.assign(dynamoEasyConfig, config)
}
