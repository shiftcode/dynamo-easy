import { MapperForType } from '../../../mapper'
import { initOrUpdateProperty } from '../property/property.decorator'

export function CustomMapper(customMapper: MapperForType<any, any>): PropertyDecorator {
  return (target: any, propertyKey: string | symbol) => {
    if (typeof propertyKey === 'string') {
      initOrUpdateProperty({ mapper: () => customMapper }, target, propertyKey)
    }
  }
}
