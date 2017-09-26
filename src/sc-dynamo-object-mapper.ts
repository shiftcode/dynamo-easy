//
// Reflect Metadata
//
//
// MomentJs locales
//
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

//
// Export public api of the library
//
// 'default' means we use js Date object or momentjs implementation for 'momentjs'
export type DateTypes = 'default' | 'moment'
export * from './decorator'
export * from './dynamo'
export * from './mapper'
export * from './model'
export * from './dynamo/request'

/*
 * TODO add fluent api for updates
 * TODO add query builder for more complex queries QB.AND(QB.NOT(condition1), QB.OR(condition1, condition2...))
 */
export class ScDynamoObjectMapper {
  // FIXME make this configurable
  static config: { dateType: DateTypes } = { dateType: 'moment' }

  constructor() {}
}
