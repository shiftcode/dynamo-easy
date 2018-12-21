import { Attributes } from '../../../mapper/type/attribute.type'

export interface Expression {
  attributeNames: Record<string, string>
  attributeValues: Attributes<any>
  statement: string
}
