/**
 * @module decorators
 */
import { PropertyMetadata } from '../../metadata/property-metadata.model'
import { initOrUpdateProperty } from './init-or-update-property.function'
import { PropertyData } from './property-data.model'

export function Property<T>(opts: Partial<PropertyData<T>> = {}): PropertyDecorator {
  return (target: object, propertyKey: string | symbol) => {
    if (typeof propertyKey === 'string') {
      const propertyOptions: Partial<PropertyMetadata<any>> = {
        name: propertyKey,
        nameDb: opts.name || propertyKey,
        defaultValueProvider: opts.defaultValueProvider,
      }

      if ('mapper' in opts && !!opts.mapper) {
        const m = opts.mapper
        propertyOptions.mapper = () => m
      }

      initOrUpdateProperty(propertyOptions, target, propertyKey)
    }
  }
}
