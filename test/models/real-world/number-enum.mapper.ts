import { MapperForType, NumberSetAttribute } from '../../../src/dynamo-easy'

// FIXME investigate: if the extra enum mapper makes sence, don't think so
export const NumberEnumMapper: MapperForType<any, NumberSetAttribute> = {
  fromDb(attributeValue: NumberSetAttribute): any[] {
    return <any[]>attributeValue.NS.map(numberEnumValue => parseInt(numberEnumValue, 10))
  },

  toDb(propertyValues: any[]): NumberSetAttribute {
    return { NS: propertyValues.map(propertyValue => propertyValue.toString()) }
  },
}
