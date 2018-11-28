import { isNumber } from 'lodash'
import { NumberAttribute } from '../type/attribute.type'
import { MapperForType } from './base.mapper'

function numberFromDb(attributeValue: NumberAttribute): number {
  if (attributeValue.N) {
    const numberValue = Number.parseFloat(attributeValue.N)
    if (isNaN(numberValue)) {
      throw new Error(`value ${attributeValue.N} resolves to NaN when parsing using Number.parseFloat`)
    }
    return numberValue
  } else {
    throw new Error('there is no N(umber) value defiend on given attribute value')
  }
}

function numberToDb(modelValue: number): NumberAttribute | null {
  if (!isNumber(modelValue)) {
    throw new Error('this mapper only support values of type number')
  }
  return { N: modelValue.toString() }
}

export const NumberMapper: MapperForType<number, NumberAttribute> = {
  fromDb: numberFromDb,
  toDb: numberToDb,
}
