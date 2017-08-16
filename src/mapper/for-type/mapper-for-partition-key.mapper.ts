import { BinaryAttributeValue, NumberAttributeValue, StringAttributeValue } from 'aws-sdk/clients/dynamodb'
import { PropertyMetadata } from '../../decorator/property-metadata.model'

export type PartitionKeyAttributeType = StringAttributeValue | NumberAttributeValue | BinaryAttributeValue

export interface MapperForPartitionKey<T> {
  fromDb(attributeValue: PartitionKeyAttributeType, propertyMetadata?: PropertyMetadata<any>): T
  toDb(propertyValue: T, propertyMetadata?: PropertyMetadata<any>): PartitionKeyAttributeType
}
