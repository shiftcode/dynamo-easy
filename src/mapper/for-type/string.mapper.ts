import { StringAttribute } from '../type/attribute.type'
import { MapperForType } from './base.mapper'

export class StringMapper implements MapperForType<string, StringAttribute> {
  fromDb(attributeValue: StringAttribute): string {
    if (attributeValue.S) {
      return attributeValue.S
    } else {
      throw new Error('there is no S(tring) value defiend on given attribute value')
    }
  }

  toDb(modelValue: string): StringAttribute | null {
    // an empty string is not a valid value for string attribute
    if (modelValue === '' || modelValue === null || modelValue === undefined) {
      return null
    } else {
      return { S: modelValue }
    }
  }
}
