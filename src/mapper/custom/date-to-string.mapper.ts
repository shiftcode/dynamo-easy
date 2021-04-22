/**
 * @module mapper
 */
import { MapperForType } from '../for-type/base.mapper'
import { StringAttribute } from '../type/attribute.type'

function dateFromDb(attributeValue: StringAttribute): Date {
  if (attributeValue.S) {
    const date = new Date(attributeValue.S)
    if (isNaN(<any>date)) {
      throw new Error('given string is not a valid date string')
    }
    return date
  } else {
    throw new Error('there is no S(tring) value defined on given attribute value')
  }
}

function dateToDb(modelValue: Date): StringAttribute {
  // noinspection SuspiciousInstanceOfGuard
  if (modelValue && modelValue instanceof Date) {
    return { S: `${modelValue.toISOString()}` }
  } else {
    throw new Error('the given model value must be an instance of Date')
  }
}

export const dateToStringMapper: MapperForType<Date, StringAttribute> = {
  fromDb: dateFromDb,
  toDb: dateToDb,
}
