import { Config } from './config'

export class DynamoEasyConfig {
  static config: Config = { dateType: 'moment', debug: true }

  static updateConfig(config: Config): void {
    Object.assign(DynamoEasyConfig.config, config)
  }

  constructor() {}
}
