import { AttributeMap } from 'aws-sdk/clients/dynamodb'

export interface ConditionExpression {
  attributeNames: { [key: string]: string }
  attributeValues: AttributeMap
  statement: string
}
