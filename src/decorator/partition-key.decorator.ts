import { initOrUpdateProperty } from './property.decorator'

// FIXME check for type of partition key only some scalars are allowed
export function PartitionKey(): PropertyDecorator {
  return function(target: Object, propertyKey: string) {
    initOrUpdateProperty({ key: { type: 'HASH' } }, target, propertyKey)
  }
}
