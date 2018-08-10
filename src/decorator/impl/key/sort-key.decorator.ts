import { initOrUpdateProperty } from '../property/property.decorator'

export function SortKey(): PropertyDecorator {
  return (target: any, propertyKey: string | symbol) => {
    if (typeof propertyKey === 'string') {
      initOrUpdateProperty({ key: { type: 'RANGE' } }, target, propertyKey)
    }
  }
}
