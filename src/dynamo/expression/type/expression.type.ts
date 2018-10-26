import { Attributes } from '../../../mapper/type/attribute.type'

export interface Expression {
  attributeNames: { [key: string]: string }
  attributeValues: Attributes
  statement: string
}
