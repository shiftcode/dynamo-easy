import { initOrUpdateProperty } from './property.decorator'

export function SortKey(): PropertyDecorator {
  return (target: any, propertyKey: string) => {
    initOrUpdateProperty({ key: { type: 'RANGE' } }, target, propertyKey)
  }
}
