import { AttributeValue } from "aws-sdk/clients/dynamodb"
import { MapperForType } from "./base.mapper"

export class DateMapper implements MapperForType<Date> {
  fromDb(attributeValue: AttributeValue): Date {
    return new Date(attributeValue.N)
  }

  toDb(modelValue: Date): AttributeValue {
    return { N: modelValue.getTime().toString() }
  }
}
