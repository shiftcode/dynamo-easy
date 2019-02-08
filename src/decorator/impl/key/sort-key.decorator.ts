/**
 * @module decorators
 */
import { initOrUpdateProperty } from '../property/init-or-update-property.function'

export function SortKey(): PropertyDecorator {
  return (target: any, propertyKey: string | symbol) => {
    if (typeof propertyKey === 'string') {
      initOrUpdateProperty({ key: { type: 'RANGE' } }, target, propertyKey)
    }
  }
}
