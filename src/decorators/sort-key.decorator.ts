import { initOrUpdateProperty } from './property.decorator'

export function SortKey(): PropertyDecorator {
  return function(target: Object, propertyKey: string) {
    initOrUpdateProperty({ sortKey: true }, target, propertyKey)
  }
}
