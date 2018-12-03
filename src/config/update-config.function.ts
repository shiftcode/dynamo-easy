import { Config } from './config.type'
import { dynamoEasyConfig } from './dynamo-easy-config'

export function updateDynamoEasyConfig(config: Partial<Config>): void {
  if (config.logReceiver !== undefined && typeof config.logReceiver !== 'function') {
    throw new Error('Config.logReceiver has to be a function')
  }
  if (config.dateMapper !== undefined && (config.dateMapper === null || typeof config.dateMapper.toDb !== 'function' || typeof config.dateMapper.fromDb !== 'function')) {
    throw new Error('Config.dateMapper must be an object of type MapperForType')
  }
  if (config.tableNameResolver !== undefined && (config.tableNameResolver === null || typeof  config.tableNameResolver !== 'function')) {
    throw new Error('Config.tableNameResolver must be function')
  }
  if (config.sessionValidityEnsurer !== undefined && (config.sessionValidityEnsurer === null || typeof config.sessionValidityEnsurer !== 'function')) {
    throw new Error('Config.sessionValidityEnsurer must be function')
  }
  Object.assign(dynamoEasyConfig, config)
}
