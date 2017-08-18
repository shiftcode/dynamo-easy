import { AttributeValue, MapAttributeValue } from 'aws-sdk/clients/dynamodb'
import { PropertyMetadata } from '../../decorator/property-metadata.model'
import { ModelConstructor } from '../../model/model-constructor'
import { Mapper } from '../mapper'
import { MapperForType } from './base.mapper'

export class ObjectMapper<T> implements MapperForType<any> {
  constructor() {}

  fromDb(val: AttributeValue, propertyMetadata?: PropertyMetadata<any>): any {
    return Mapper.fromDb(
      val.M,
      propertyMetadata && propertyMetadata.typeInfo && propertyMetadata.typeInfo.isCustom
        ? propertyMetadata.typeInfo.type
        : null
    )
  }

  toDb(value: any, propertyMetadata?: PropertyMetadata<any>): MapAttributeValue {
    return {
      M: Mapper.toDb<any>(
        value,
        propertyMetadata && propertyMetadata.typeInfo && propertyMetadata.typeInfo.isCustom
          ? propertyMetadata.typeInfo.type
          : null
      ),
    }
  }
}
