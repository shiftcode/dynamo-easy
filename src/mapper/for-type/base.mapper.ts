import { AttributeValue } from 'aws-sdk/clients/dynamodb'
import { PropertyMetadata } from '../../decorator/metadata/property-metadata.model'

export interface MapperForType<T> {
  // FIXME review typing
  fromDb(attributeValue: AttributeValue, propertyMetadata?: PropertyMetadata<any>): T
  toDb(propertyValue: T, propertyMetadata?: PropertyMetadata<any>): AttributeValue
}
