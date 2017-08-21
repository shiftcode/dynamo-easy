import construct = Reflect.construct
import { AttributeValue } from 'aws-sdk/clients/dynamodb'
import { Mapper } from '../mapper'
import { MapperForType } from './base.mapper'

export class MapMapper implements MapperForType<Map<any, any>> {
  constructor() {}

  fromDb(attributeValue: AttributeValue): Map<any, any> {
    return undefined
  }

  toDb(propertyValue: Map<any, any>): AttributeValue {
    const obj: { [key: string]: string } = {}
    for (const [key, value] of propertyValue) {
      obj[key] = value
    }

    return {
      M: Mapper.toDb<any>(obj),
    }
  }
}
