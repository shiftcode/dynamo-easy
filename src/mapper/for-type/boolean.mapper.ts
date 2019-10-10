/**
 * @module mapper
 */
import { BooleanAttribute } from '../type/attribute.type'
import { MapperForType } from './base.mapper'

function booleanFromDb(attributeValue: BooleanAttribute): boolean {
  if (attributeValue.BOOL === undefined) {
    throw new Error(`there is no BOOL(ean) value defined on given attribute value: ${JSON.stringify(attributeValue)}`)
  }
  return attributeValue.BOOL === true
}

function booleanToDb(modelValue: boolean): BooleanAttribute {
  if (!(modelValue === true || modelValue === false)) {
    throw new Error(`only boolean values are mapped to a BOOl attribute, given: ${JSON.stringify(modelValue)}`)
  }
  return { BOOL: modelValue }
}

export const BooleanMapper: MapperForType<boolean, BooleanAttribute> = {
  fromDb: booleanFromDb,
  toDb: booleanToDb,
}
