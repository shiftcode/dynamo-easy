/**
 * @module mapper
 */
import { StringAttribute } from '../type/attribute.type'
import { MapperForType } from './base.mapper'

function stringFromDb(attributeValue: StringAttribute): string {
  if (attributeValue.S || attributeValue.S === '') {
    return attributeValue.S
  } else {
    throw new Error(`there is no S(tring) value defined on given attribute value: ${JSON.stringify(attributeValue)}`)
  }
}

function stringToDb(modelValue: string): StringAttribute | null {
  // an empty string is valid for a string attribute
  if (modelValue === null || modelValue === undefined) {
    return null
  } else {
    return { S: modelValue }
  }
}

export const StringMapper: MapperForType<string, StringAttribute> = {
  fromDb: stringFromDb,
  toDb: stringToDb,
}
