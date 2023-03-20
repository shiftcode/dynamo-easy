/**
 * @module decorators
 */
import { KeyType } from '../../../aws-sdk-v2.types'
import { createOptModelLogger } from '../../../logger/logger'
import { PropertyMetadata } from '../../metadata/property-metadata.model'
import { initOrUpdateProperty } from '../property/init-or-update-property.function'
import { KEY_PROPERTY } from '../property/key-property.const'

const logger = createOptModelLogger('@PartitionKey')

export function PartitionKey(): PropertyDecorator {
  return (target: any, propertyKey: string | symbol) => {
    if (typeof propertyKey === 'string') {
      // check for existing properties marked as partition key
      const properties: Array<PropertyMetadata<any>> = Reflect.getMetadata(KEY_PROPERTY, target.constructor) || []
      if (properties && properties.length) {
        const existingPartitionKeys = properties.filter((property) => property.key && property.key.type === 'HASH')
        if (existingPartitionKeys.length) {
          if (properties.find((property) => property.name === propertyKey)) {
            // just ignore this and go on, somehow the partition key gets defined two times
            logger.warn(
              `this is the second execution to define the partitionKey for property ${propertyKey}`,
              target.constructor,
            )
          } else {
            throw new Error(
              'only one partition key is allowed per model, if you want to define key for indexes use one of these decorators: ' +
                '@GSIPartitionKey,  @GSISortKey or @LSISortKey',
            )
          }
        }
      }

      initOrUpdateProperty({ key: { type: KeyType.HASH } }, target, propertyKey)
    }
  }
}
