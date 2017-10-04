import { PropertyMetadata } from '../../metadata/property-metadata.model'
import { initOrUpdateProperty, KEY_PROPERTY } from '../property/property.decorator'

export function PartitionKey(): PropertyDecorator {
  return (target: any, propertyKey: string) => {
    // check for existing properties marked as partition key
    const properties: Array<PropertyMetadata<any>> = Reflect.getMetadata(KEY_PROPERTY, target.constructor) || []
    if (properties && properties.length) {
      const existingPartitionKeys = properties.filter(property => property.key && property.key.type === 'HASH')
      if (existingPartitionKeys.length) {
        if (properties.find(property => property.name === propertyKey)) {
          // just ignore this and go on, somehow the partition key gets defined
          // tslint:disable-next-line:no-console
          console.warn(`this is the second execution to define the paritionKey for propety ${propertyKey}`)
        } else {
          throw new Error(
            'only one partition key is allowed per model, if you want to define key for indexes use one of these decorators: ' +
              '@GSIPartitionKey,  @GSISortKey or @LSISortKey'
          )
        }
      }
    }

    initOrUpdateProperty({ key: { type: 'HASH' } }, target, propertyKey)
  }
}
