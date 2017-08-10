// Import here Polyfills if needed. Recommended core-js (npm i -D core-js)
// import "core-js/fn/array.find"
// ...
//
import "rxjs/add/observable/fromPromise"
//
import "rxjs/add/operator/map"

// 'default' means we use js Date object or momentjs implementation for 'momentjs'
export type DateTypes = "default" | "moment"

export class ScDynamoObjectMapper {
  // FIXME make this configurable
  static config: { dateType: DateTypes } = { dateType: "moment" }

  constructor() {
    let map: Map<string, string> = new Map()
  }
}
