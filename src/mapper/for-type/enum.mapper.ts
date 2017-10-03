import { AttributeValue } from 'aws-sdk/clients/dynamodb'
import { PropertyMetadata } from '../../decorator/metadata/property-metadata.model'
import { MapperForType } from './base.mapper'

/**
 * Enums are mapped to numbers by default
 */
export class EnumMapper<E> implements MapperForType<E> {
  constructor() {}

  toDb(value: E, propertyMetadata: PropertyMetadata<any>) {
    if (Number.isInteger(<any>value)) {
      return { N: value.toString() }
    } else {
      throw new Error('only integer number is a valid value for an enum')
    }
  }

  fromDb(attributeValue: AttributeValue): E {
    if (!isNaN(parseInt(attributeValue.N!, 10))) {
      return <any>parseInt(attributeValue.N!, 10)
    } else {
      throw new Error('make sure the value is a N(umber), which is the only supported for EnumMapper right now')
    }
  }
}
