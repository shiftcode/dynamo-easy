//
// Reflect Metadata
//
import 'reflect-metadata'
import { Config } from './config'

//
// Export public api of the library
//
export * from './decorator'
export * from './dynamo'
export * from './mapper'
export * from './model'
export * from './date-types.type'
export * from './config'

export class DynamoEasy {
  static config: Config = { dateType: 'moment', debug: true }

  static updateConfig(config: Config): void {
    Object.assign(DynamoEasy.config, config)
  }

  constructor() {}
}
