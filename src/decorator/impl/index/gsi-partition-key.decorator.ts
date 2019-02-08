import { IndexType } from './index-type.enum'
import { initOrUpdateIndex } from './util'

/**
 * decorator to use property as GSI partition key
 */
export function GSIPartitionKey(indexName: string): PropertyDecorator {
  return (target: any, propertyKey: string | symbol) => {
    if (typeof propertyKey === 'string') {
      initOrUpdateIndex(IndexType.GSI, { name: indexName, keyType: 'HASH' }, target, propertyKey)
    }
  }
}
