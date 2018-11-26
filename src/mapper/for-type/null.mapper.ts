import { NullAttribute } from '../type/attribute.type'
import { MapperForType } from './base.mapper'

function nullFromDb(value: NullAttribute): null {
  if (value.NULL) {
    return null
  } else {
    throw new Error(`there is no NULL value defiend on given attribute value ${value}`)
  }
}

function nullToDb(value: null): NullAttribute | null {
  if (value !== null) {
    throw new Error(`null mapper only supports null value, got ${value}`)
  }

  return { NULL: true }
}

export const NullMapper: MapperForType<null, NullAttribute> = {
  fromDb: nullFromDb,
  toDb: nullToDb,
}
