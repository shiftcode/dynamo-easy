import { MapperForType } from '../../../mapper/for-type/base.mapper'
import { Attribute } from '../../../mapper/type/attribute.type'
import { ModelConstructor } from '../../../model/model-constructor'
import { initOrUpdateProperty } from '../property/property.decorator'

export function CustomMapper<T extends Attribute>(
  mapperClazz: ModelConstructor<MapperForType<any, T>>
): PropertyDecorator {
  return (target: any, propertyKey: string | symbol) => {
    if (typeof propertyKey === 'string') {
      initOrUpdateProperty({ mapper: mapperClazz }, target, propertyKey)
    }
  }
}
