import { PropertyMetadata } from '../../../src/decorator'
import { MapperForType } from '../../../src/mapper'
import { NumberSetAttribute } from '../../../src/mapper/type/attribute.type'

export class NumberEnumMapper implements MapperForType<any, NumberSetAttribute> {
  fromDb(attributeValue: NumberSetAttribute, propertyMetadata?: PropertyMetadata<any>): any[] {
    return <any[]>attributeValue.NS.map(numberEnumValue => parseInt(numberEnumValue, 10))
  }

  toDb(propertyValues: any[], propertyMetadata?: PropertyMetadata<any>): NumberSetAttribute {
    return { NS: propertyValues.map(propertyValue => propertyValue.toString()) }
  }
}
