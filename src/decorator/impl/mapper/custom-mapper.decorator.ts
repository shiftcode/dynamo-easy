import { MapperForType } from '../../../mapper/for-type/base.mapper'
import { ModelConstructor } from '../../../model/model-constructor'
import { initOrUpdateProperty } from '../property/property.decorator'

export function CustomMapper(mapperClazz: ModelConstructor<MapperForType<any>>): PropertyDecorator {
  return (target: any, propertyKey: string | symbol) => {
    if (typeof propertyKey === 'string') {
      initOrUpdateProperty({ mapper: mapperClazz }, target, propertyKey)
    }
  }
}
