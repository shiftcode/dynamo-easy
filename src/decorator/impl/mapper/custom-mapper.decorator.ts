import { MapperForType } from '../../../mapper/for-type/base.mapper'
import { ModelConstructor } from '../../../model/model-constructor'
import { PropertyMetadata } from '../../metadata/property-metadata.model'
import { initOrUpdateProperty, KEY_PROPERTY } from '../property/property.decorator'

export function CustomMapper(mapperClazz: ModelConstructor<MapperForType<any>>): PropertyDecorator {
  return (target: any, propertyKey: string) => {
    initOrUpdateProperty({ mapper: mapperClazz }, target, propertyKey)
  }
}
