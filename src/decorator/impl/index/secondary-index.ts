/**
 * @module decorators
 */
/**
 * @hidden
 */
export interface SecondaryIndex<T> {
  partitionKey: keyof T
  sortKey?: keyof T
}
