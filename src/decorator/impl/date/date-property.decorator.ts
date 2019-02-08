/**
 * @module decorators
 */
import { dynamoEasyConfig } from '../../../config/dynamo-easy-config'
import { PropertyMetadata } from '../../metadata/property-metadata.model'
import { initOrUpdateProperty } from '../property/init-or-update-property.function'
import { DatePropertyData } from './date-property-data.model'

export function DateProperty(opts: Partial<DatePropertyData> = {}): PropertyDecorator {
  return (target: any, propertyKey: string | symbol) => {
    if (typeof propertyKey === 'string') {

      const propertyOptions: Partial<PropertyMetadata<any>> = {
        name: propertyKey,
        nameDb: opts.name || propertyKey,
        mapper: () => dynamoEasyConfig.dateMapper,
      }

      initOrUpdateProperty(propertyOptions, target, propertyKey)
    }
  }
}
