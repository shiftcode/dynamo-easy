/**
 * @module decorators
 */
import { KeyType } from '@aws-sdk/client-dynamodb'
import { initOrUpdateProperty } from '../property/init-or-update-property.function'

export function SortKey(): PropertyDecorator {
  return (target: any, propertyKey: string | symbol) => {
    if (typeof propertyKey === 'string') {
      initOrUpdateProperty({ key: { type: KeyType.RANGE } }, target, propertyKey)
    }
  }
}
