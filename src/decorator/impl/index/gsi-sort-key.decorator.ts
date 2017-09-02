import { initOrUpdateIndex } from '../property/property.decorator'
import { IndexType } from './index-type.enum'

export function GSISortKey(indexName: string): PropertyDecorator {
  return (target: any, propertyKey: string) => {
    initOrUpdateIndex(IndexType.GSI, { name: indexName, keyType: 'RANGE' }, target, propertyKey)
  }
}
