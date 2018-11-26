import { MapperForType } from '../../../src/mapper'
import { NumberSetAttribute } from '../../../src/mapper/type/attribute.type'

export const NumberEnumMapper: MapperForType<any, NumberSetAttribute> = {
  fromDb(attributeValue: NumberSetAttribute): any[] {
    return <any[]>attributeValue.NS.map(numberEnumValue => parseInt(numberEnumValue, 10))
  },

  toDb(propertyValues: any[]): NumberSetAttribute {
    return { NS: propertyValues.map(propertyValue => propertyValue.toString()) }
  },
}
