export interface ModelConstructor<T> {
  new (...args: any[]): T
}
