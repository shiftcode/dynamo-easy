import { Tag } from './tag.enum'

/**
 * @return Returns the value (we call it tag) returned by function call `value.toString`,
 */
export function getTag(value: any): Tag | string {
  return Object.prototype.toString.call(value)
}
