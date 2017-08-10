import { MapperForType } from "./base.mapper"
import { AttributeValue, MapAttributeValue } from "aws-sdk/clients/dynamodb"
import { Mapper } from "../mapper"

export class ObjectMapper<T> implements MapperForType<any> {
  constructor() {}

  fromDb(val: AttributeValue): any {
    return Mapper.mapFromDb(val.M)
  }

  toDb(value: any): MapAttributeValue {
    return {
      M: Mapper.mapToDb<any>(value)
    }
  }
}
