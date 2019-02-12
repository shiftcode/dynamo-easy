/**
 * @module expression
 */
import { Attributes } from '../../../mapper/type/attribute.type'

/**
 * @hidden
 */
export interface Expression {
  attributeNames: Record<string, string>
  attributeValues: Attributes<any>
  statement: string
}
