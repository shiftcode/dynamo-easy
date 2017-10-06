import { AttributeMap } from 'aws-sdk/clients/dynamodb'

export interface Expression {
  attributeNames: { [key: string]: string }
  attributeValues: AttributeMap
  statement: string
}
