import { getTag } from './get-tag.function'
import { Tag } from './tag.enum'

/**
 * @return Returns true for any value where typeof equals 'string' or an object created with String constructor
 */
export function isBoolean(value: any): boolean {
  return typeof value === 'boolean' || getTag(value) === Tag.BOOLEAN
}
