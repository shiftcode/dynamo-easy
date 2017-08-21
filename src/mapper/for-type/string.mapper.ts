import { AttributeValue } from 'aws-sdk/clients/dynamodb'
import { MapperForType } from './base.mapper'

export class StringMapper implements MapperForType<string> {
  constructor() {}

  fromDb(dbVaattributeValueue: AttributeValue): string {
    if (dbVaattributeValueue.S) {
      return dbVaattributeValueue.S
    } else {
      throw new Error('there is no S(tring) value defiend on given attribute value')
    }
  }

  toDb(modelValue: string): AttributeValue {
    return { S: modelValue }
  }
}
