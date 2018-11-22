import { PropertyMetadata } from '../../decorator/metadata/property-metadata.model'
import { fromDb, toDb } from '../mapper'
import { MapAttribute } from '../type/attribute.type'
import { MapperForType } from './base.mapper'

export class ObjectMapper<T> implements MapperForType<any, MapAttribute> {
  fromDb(val: MapAttribute, propertyMetadata?: PropertyMetadata<any, MapAttribute>): any {
    if (propertyMetadata && propertyMetadata.typeInfo && propertyMetadata.typeInfo.isCustom) {
      return fromDb(val.M, propertyMetadata.typeInfo.type)
    } else {
      return fromDb(val.M)
    }
  }

  toDb(modelValue: any, propertyMetadata?: PropertyMetadata<any, MapAttribute>): MapAttribute {
    let value: any
    if (propertyMetadata && propertyMetadata.typeInfo && propertyMetadata.typeInfo.isCustom) {
      value = toDb(modelValue, propertyMetadata.typeInfo.type)
    } else {
      value = toDb(modelValue)
    }

    return { M: value }
  }
}
