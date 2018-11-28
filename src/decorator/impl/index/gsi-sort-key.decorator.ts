import { IndexType } from './index-type.enum'
import { initOrUpdateIndex } from './util'

export function GSISortKey(indexName: string): PropertyDecorator {
  return (target: any, propertyKey: string | symbol) => {
    if (typeof propertyKey === 'string') {
      initOrUpdateIndex(IndexType.GSI, { name: indexName, keyType: 'RANGE' }, target, propertyKey)
    }
  }
}
