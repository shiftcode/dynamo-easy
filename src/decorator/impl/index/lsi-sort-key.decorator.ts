import { initOrUpdateIndex } from '../property/property.decorator'
import { IndexType } from './index-type.enum'

/**
 * Marks a property as the sort key attribute of a local secondary index (the partition key must be same as in base table)
 *
 * @param {string} indexName Name of the local secondary index
 * @returns {PropertyDecorator}
 */
export function LSISortKey(indexName: string): PropertyDecorator {
  return (target: any, propertyKey: string) => {
    initOrUpdateIndex(IndexType.LSI, { name: indexName, keyType: 'RANGE' }, target, propertyKey)
  }
}
