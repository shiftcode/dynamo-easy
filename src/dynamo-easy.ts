//
// Reflect Metadata
//
//
// MomentJs locales
//
// TODO MOMENT we should import other locals (should we just import all locales for now?)
import 'moment/locale/de-ch'
import 'reflect-metadata'
//
// RxJs
//
import 'rxjs/add/observable/combineLatest'
import 'rxjs/add/observable/fromPromise'
import 'rxjs/add/observable/of'
//
import 'rxjs/add/operator/do'
import 'rxjs/add/operator/finally'
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/publishReplay'
import 'rxjs/add/operator/share'
import 'rxjs/add/operator/switchMap'
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
