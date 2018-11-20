import { Config } from './config'

export class DynamoEasyConfig {
  static config: Config = {
    dateType: 'moment',
    logReceiver: () => {},
  }

  static updateConfig(config: Partial<Config>): void {
    if (config.logReceiver !== undefined && typeof config.logReceiver !== 'function') {
      throw new Error('Config.logReceiver has to be a function')
    }
    Object.assign(DynamoEasyConfig.config, config)
  }

  constructor() {}
}
