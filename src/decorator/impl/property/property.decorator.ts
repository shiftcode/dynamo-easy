import { PropertyMetadata } from '../../metadata/property-metadata.model'
import { initOrUpdateProperty } from './init-or-update-property.function'
import { PropertyData } from './property-data.model'

export function Property(opts: Partial<PropertyData> = {}): PropertyDecorator {
  return (target: object, propertyKey: string | symbol) => {
    if (typeof propertyKey === 'string') {
      const propertyOptions: Partial<PropertyMetadata<any>> = {
        name: propertyKey,
        nameDb: opts.name || propertyKey,
      }

      if ('mapper' in opts && !!opts.mapper) {
        const m = opts.mapper
        propertyOptions.mapper = () => m
      }

      initOrUpdateProperty(propertyOptions, target, propertyKey)
    }
  }
}
