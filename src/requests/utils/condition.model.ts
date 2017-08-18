import { AttributeMap } from 'aws-sdk/clients/dynamodb'

export interface Condition {
  attributeNames: { [key: string]: string }
  attributeMap: AttributeMap
  statement: string
}
