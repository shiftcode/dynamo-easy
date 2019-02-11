/**
 * @module decorators
 */
import { initOrUpdateProperty } from '../property/init-or-update-property.function'

export function PartitionKeyUUID(): PropertyDecorator {
  return (target: any, propertyKey: string | symbol) => {
    if (typeof propertyKey === 'string') {
      initOrUpdateProperty({ key: { type: 'HASH', uuid: true } }, target, propertyKey)
    }
  }
}
