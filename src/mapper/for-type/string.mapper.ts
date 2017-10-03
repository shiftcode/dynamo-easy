import { AttributeValue } from 'aws-sdk/clients/dynamodb'
import { MapperForType } from './base.mapper'

export class StringMapper implements MapperForType<string> {
  constructor() {}

  fromDb(attributeValue: AttributeValue): string {
    if (attributeValue.S) {
      return attributeValue.S
    } else {
      throw new Error('there is no S(tring) value defiend on given attribute value')
    }
  }

  toDb(modelValue: string): AttributeValue | null {
    // an empty string is not a valid value for string attribute
    if (modelValue === '' || modelValue === null || modelValue === undefined) {
      return null
    } else {
      return { S: modelValue }
    }
  }
}
