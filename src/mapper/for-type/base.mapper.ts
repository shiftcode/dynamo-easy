import { AttributeValue } from "aws-sdk/clients/dynamodb"

export interface MapperForType<T> {
  fromDb(attributeValue: AttributeValue): T
  toDb(propertyValue: T): AttributeValue
}
