import { MapperForType } from "./base.mapper"
import construct = Reflect.construct
import { AttributeValue } from "aws-sdk/clients/dynamodb"
import { Mapper } from "../mapper"

export class MapMapper implements MapperForType<Map<any, any>> {
  constructor() {}

  fromDb(attributeValue: AttributeValue): Map<any, any> {
    return undefined
  }

  toDb(propertyValue: Map<any, any>): AttributeValue {
    let obj: { [key: string]: string } = {}
    for (let [key, value] of propertyValue) {
      obj[key] = value
    }

    return {
      M: Mapper.mapToDb<any>(obj)
    }
  }
}
