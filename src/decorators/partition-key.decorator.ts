import { PropertyMetadata } from "./property-metadata.model"
import { initOrUpdateProperty, KEY_PROPERTY } from "./property.decorator"

// FIXME check for type of partition key only some scalars are allowed
export function PartitionKey(): PropertyDecorator {
  return function(target: Object, propertyKey: string) {
    initOrUpdateProperty({ partitionKey: true }, target, propertyKey)
  }
}
