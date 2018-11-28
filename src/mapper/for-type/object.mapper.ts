import { PropertyMetadata } from '../../decorator/metadata'
import { fromDb, toDb } from '../mapper'
import { Attributes, MapAttribute } from '../type/attribute.type'
import { MapperForType } from './base.mapper'

function objectFromDb(val: MapAttribute, propertyMetadata?: PropertyMetadata<any, MapAttribute>): any {
  if (propertyMetadata && propertyMetadata.typeInfo && propertyMetadata.typeInfo.isCustom) {
    return fromDb(val.M, propertyMetadata.typeInfo.type)
  } else {
    return fromDb(val.M)
  }
}

function objectToDb(modelValue: any, propertyMetadata?: PropertyMetadata<any, MapAttribute>): MapAttribute {
  let value: Attributes
  if (propertyMetadata && propertyMetadata.typeInfo && propertyMetadata.typeInfo.isCustom) {
    value = toDb(modelValue, propertyMetadata.typeInfo.type)
  } else {
    value = toDb(modelValue)
  }

  return { M: value }
}

export const ObjectMapper: MapperForType<any, MapAttribute> = {
  fromDb: objectFromDb,
  toDb: objectToDb,
}
