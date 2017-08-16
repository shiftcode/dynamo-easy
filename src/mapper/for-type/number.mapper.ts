import { AttributeValue } from 'aws-sdk/clients/dynamodb'
import { MapperForType } from './base.mapper'

export class NumberMapper implements MapperForType<number> {
  fromDb(dbValue: AttributeValue): number {
    return Number.parseFloat(dbValue.N)
  }

  toDb(modelValue: number): AttributeValue {
    return { N: modelValue.toString() }
  }
}
