import { AttributeMap, AttributeValue, MapAttributeValue } from 'aws-sdk/clients/dynamodb'
import { PropertyMetadata } from '../../decorator/property-metadata.model'
import { Mapper } from '../mapper'
import { MapperForType } from './base.mapper'

export class ObjectMapper<T> implements MapperForType<any> {
  constructor() {}

  fromDb(val: AttributeValue, propertyMetadata?: PropertyMetadata<any>): any {
    if (propertyMetadata && propertyMetadata.typeInfo && propertyMetadata.typeInfo.isCustom) {
      return Mapper.fromDb(<AttributeMap>val.M, propertyMetadata.typeInfo.type)
    } else {
      return Mapper.fromDb(<AttributeMap>val.M)
    }
  }

  toDb(modelValue: any, propertyMetadata?: PropertyMetadata<any>): MapAttributeValue {
    let value: any
    if (propertyMetadata && propertyMetadata.typeInfo && propertyMetadata.typeInfo.isCustom) {
      value = Mapper.toDb(modelValue, propertyMetadata.typeInfo.type)
    } else {
      value = Mapper.toDb(modelValue)
    }

    return { M: value }
  }
}
