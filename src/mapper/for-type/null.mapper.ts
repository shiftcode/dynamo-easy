import { AttributeValue } from 'aws-sdk/clients/dynamodb'
import moment from 'moment-es6'
import { MapperForType } from './base.mapper'

export class NullMapper implements MapperForType<null> {
  constructor() {}

  fromDb(value: AttributeValue): null {
    return null
  }

  toDb(value: null): AttributeValue {
    return { NULL: true }
  }
}
