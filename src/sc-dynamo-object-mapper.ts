// Import here Polyfills if needed. Recommended core-js (npm i -D core-js)
// import 'core-js/fn/array.includes'
// ...
//
import 'rxjs/add/observable/fromPromise'
import 'rxjs/add/observable/of'
//
import 'rxjs/add/operator/map'
//
import { INDEX_ACTIVE_CREATED_AT, ModelWithGSI } from '../test/models/model-with-indexes.model'

// 'default' means we use js Date object or momentjs implementation for 'momentjs'
export type DateTypes = 'default' | 'moment'
export * from './decorator'
export * from './dynamo'
export * from './mapper'

export class ScDynamoObjectMapper {
  // FIXME make this configurable
  static config: { dateType: DateTypes } = { dateType: 'moment' }

  constructor() {
    const map: Map<string, string> = new Map()

    // const qReq = new QueryRequest(new DynamoRx(), ModelWithGSI);
    // qReq.index(INDEX_ACTIVE_CREATED_AT)
    //   .wherePartitionKey()
    //   .whereSortKey().
    //   .filter()
    //   .exec()
  }
}
