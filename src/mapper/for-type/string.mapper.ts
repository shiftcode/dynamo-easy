import { AttributeValue } from 'aws-sdk/clients/dynamodb'
import { MapperForType } from './base.mapper'

export class StringMapper implements MapperForType<string> {
  constructor() {}

  fromDb(dbValue: AttributeValue): string {
    return dbValue.S
  }

  toDb(modelValue: string): AttributeValue {
    return { S: modelValue }
  }
}
