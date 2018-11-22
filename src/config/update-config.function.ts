import { Config } from './config.type'
import { dynamoEasyConfig } from './dynamo-easy-config'

export function updateDynamoEasyConfig(config: Partial<Config>): void {
  Object.assign(dynamoEasyConfig, config)
}
