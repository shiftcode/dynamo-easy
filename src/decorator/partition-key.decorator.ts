import { PropertyMetadata } from './property-metadata.model'
import { initOrUpdateProperty, KEY_PROPERTY } from './property.decorator'

// TODO check for type of partition key only some scalars are allowed, there could be a custom mapper and the order of decorators cannot be guaranted
export function PartitionKey(): PropertyDecorator {
  return (target: any, propertyKey: string) => {
    // check for existing properties marked as partition key
    const properties: Array<PropertyMetadata<any>> = Reflect.getMetadata(KEY_PROPERTY, target.constructor) || []
    if (properties && properties.length) {
      const existingPartitionKeys = properties.filter(property => property.key && property.key.type === 'HASH')
      if (existingPartitionKeys.length) {
        throw new Error(
          'only one partition key is allowed per model, if you want to define keys for indexes use one of these decorators: ' +
            '@GSIPartitionKey,  @GSISortKey or @LSISortKey'
        )
      }
    }

    initOrUpdateProperty({ key: { type: 'HASH' } }, target, propertyKey)
  }
}
