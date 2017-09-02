import { initOrUpdateIndex } from '../property/property.decorator'
import { IndexType } from './index-type.enum'

export function GSIPartitionKey(indexName: string): PropertyDecorator {
  return (target: any, propertyKey: string) => {
    initOrUpdateIndex(IndexType.GSI, { name: indexName, keyType: 'HASH' }, target, propertyKey)
  }
}
