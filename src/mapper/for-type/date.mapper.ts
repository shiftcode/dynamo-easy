import { AttributeValue } from 'aws-sdk/clients/dynamodb'
import { MapperForType } from './base.mapper'

export class DateMapper implements MapperForType<Date> {
  fromDb(attributeValue: AttributeValue): Date {
    if (attributeValue.N) {
      return new Date(parseInt(attributeValue.N, 10))
    } else {
      throw new Error('there is no N(umber) value defiend on given attribute value')
    }
  }

  toDb(modelValue: Date): AttributeValue {
    if (modelValue && modelValue instanceof Date) {
      return { N: `${modelValue.getTime()}` }
    } else {
      throw new Error('the given model value must be an instance of Date')
    }
  }
}
