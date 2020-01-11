/**
 * @module mapper
 */
import { NullAttribute } from '../type/attribute.type'
import { MapperForType } from './base.mapper'

function nullFromDb(attributeValue: NullAttribute): null {
  if (attributeValue.NULL) {
    return null
  } else {
    throw new Error(`there is no NULL value defined on given attribute value: ${JSON.stringify(attributeValue)}`)
  }
}

function nullToDb(value: null): NullAttribute {
  if (value !== null) {
    throw new Error(`null mapper only supports null value, got ${JSON.stringify(value)}`)
  }

  return { NULL: true }
}

export const NullMapper: MapperForType<null, NullAttribute> = {
  fromDb: nullFromDb,
  toDb: nullToDb,
}
