import { AttributeValue } from 'aws-sdk/clients/dynamodb'
import moment from 'moment-es6'
import { MapperForType } from './base.mapper'

export class NullMapper implements MapperForType<null> {
  constructor() {}

  fromDb(value: AttributeValue): null {
    if (value.NULL) {
      return null
    } else {
      throw new Error(`there is no NULL value defiend on given attribute value ${value}`)
    }
  }

  toDb(value: null): AttributeValue {
    if (value !== null) {
      throw new Error(`null mapper only supports null value, got ${value}`)
    }

    return { NULL: true }
  }
}
