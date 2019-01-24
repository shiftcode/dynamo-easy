import { MapperForType } from '../../../mapper'
import { initOrUpdateProperty } from '../property/init-or-update-property.function'

/**
 *
 * @param customMapper
 * @deprecated use @Property({mapper: YourCustomMapper}) instead
 */
export function CustomMapper(customMapper: MapperForType<any, any>): PropertyDecorator {
  return (target: any, propertyKey: string | symbol) => {
    if (typeof propertyKey === 'string') {
      initOrUpdateProperty({ mapper: () => customMapper }, target, propertyKey)
    }
  }
}
