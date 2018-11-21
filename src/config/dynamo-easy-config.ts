import { DateToStringMapper } from '../mapper/custom'
import { Config } from './config'

/**
 * to update the config you must do it before importing any model, basically before anything else.
 * the config cannot be changed afterwards
 */
export class DynamoEasyConfig {
  static config: Config = {
    dateMapper: DateToStringMapper,
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
