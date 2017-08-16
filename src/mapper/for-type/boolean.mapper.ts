import { AttributeValue } from 'aws-sdk/clients/dynamodb'
import { MapperForType } from './base.mapper'

export class BooleanMapper implements MapperForType<boolean> {
  fromDb(dbValue: any): boolean {
    return dbValue.BOOL === true
  }

  toDb(modelValue: boolean): AttributeValue {
    return { BOOL: modelValue }
  }
}
