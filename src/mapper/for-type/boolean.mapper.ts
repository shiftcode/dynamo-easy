import { BooleanAttribute } from '../type/attribute.type'
import { MapperForType } from './base.mapper'

function booleanFromDb(dbValue: BooleanAttribute): boolean {
  if (dbValue.BOOL === undefined) {
    throw new Error('only attribute values with BOOL value can be mapped to a boolean')
  }
  return dbValue.BOOL === true
}

function booleanToDb(modelValue: boolean): BooleanAttribute {
  if (!(modelValue === true || modelValue === false)) {
    throw new Error('only boolean values are mapped to a BOOl attribute')
  }
  return { BOOL: modelValue }
}

export const BooleanMapper: MapperForType<boolean, BooleanAttribute> = {
  fromDb: booleanFromDb,
  toDb: booleanToDb,
}
