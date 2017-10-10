import { AttributeValue } from 'aws-sdk/clients/dynamodb'
import { MapperForType } from './base.mapper'

export class BooleanMapper implements MapperForType<boolean> {
  fromDb(dbValue: any): boolean {
    if (dbValue.BOOL === undefined) {
      throw new Error('only attribute values with BOOL value can be mapped to a boolean')
    }

    return dbValue.BOOL === true
  }

  toDb(modelValue: boolean): AttributeValue {
    if (!(modelValue === true || modelValue === false)) {
      throw new Error('only boolean values are mapped to a BOOl attribute')
    }

    return { BOOL: modelValue }
  }
}
