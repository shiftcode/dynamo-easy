// https://github.com/jonschlinkert/is-plain-object
import { getTag } from './get-tag.function'
import { Tag } from './tag.enum'

function isObject(val: any) {
  return val != null && typeof val === 'object' && Array.isArray(val) === false
}

function isObjectObject(o: any): boolean {
  return isObject(o) === true && getTag(o) === Tag.OBJECT
}

export function isPlainObject(o: any): boolean {
  return !(
    !isObjectObject(o) ||
    typeof o.constructor !== 'function' ||
    !isObjectObject(o.constructor.prototype) ||
    !o.constructor.prototype.hasOwnProperty('isPrototypeOf')
  )
}
