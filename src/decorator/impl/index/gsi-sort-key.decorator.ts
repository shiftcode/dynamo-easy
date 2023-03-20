/**
 * @module decorators
 */
import { KeyType } from '../../../aws-sdk-v2.types'
import { IndexType } from './index-type.enum'
import { initOrUpdateIndex } from './util'

/**
 * decorator to use property as GSI sort key
 */
export function GSISortKey(indexName: string): PropertyDecorator {
  return (target: any, propertyKey: string | symbol) => {
    if (typeof propertyKey === 'string') {
      initOrUpdateIndex(IndexType.GSI, { name: indexName, keyType: KeyType.RANGE }, target, propertyKey)
    }
  }
}
