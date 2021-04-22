/**
 * @module mapper
 */
import { MapperForType } from '../for-type/base.mapper'
import { NumberAttribute } from '../type/attribute.type'

function dateFromDb(attributeValue: NumberAttribute): Date {
  if (attributeValue.N) {
    return new Date(parseInt(attributeValue.N, 10))
  } else {
    throw new Error('there is no N(umber) value defined on given attribute value')
  }
}

function dateToDb(modelValue: Date): NumberAttribute {
  // noinspection SuspiciousInstanceOfGuard
  if (modelValue && modelValue instanceof Date) {
    return { N: `${modelValue.getTime()}` }
  } else {
    throw new Error('the given model value must be an instance of Date')
  }
}

export const dateToNumberMapper: MapperForType<Date, NumberAttribute> = {
  fromDb: dateFromDb,
  toDb: dateToDb,
}
