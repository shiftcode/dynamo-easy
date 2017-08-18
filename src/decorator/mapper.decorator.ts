import { MapperForType } from '../mapper/for-type/base.mapper'
import { ModelConstructor } from '../model/model-constructor'
import { PropertyMetadata } from './property-metadata.model'
import { initOrUpdateProperty, KEY_PROPERTY } from './property.decorator'

// FIXME add type for MapperForPartitionKey, which limits to the allowed type of dynamodb partition keys
// FIXME check for type of partition key only some scalars are allowed
// TODO add binary as possible value
export function Mapper(mapperClazz: ModelConstructor<MapperForType<any>>): PropertyDecorator {
  return (target: any, propertyKey: string) => {
    initOrUpdateProperty({ mapper: mapperClazz }, target, propertyKey)
  }
}
