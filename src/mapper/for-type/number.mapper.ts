import { AttributeValue } from 'aws-sdk/clients/dynamodb'
import { MapperForType } from './base.mapper'

export class NumberMapper implements MapperForType<number> {
  fromDb(attributeValue: AttributeValue): number {
    if (attributeValue.N) {
      return Number.parseFloat(attributeValue.N)
    } else {
      throw new Error('there is no N(umber) value defiend on given attribute value')
    }
  }

  toDb(modelValue: number): AttributeValue {
    return { N: modelValue.toString() }
  }
}
