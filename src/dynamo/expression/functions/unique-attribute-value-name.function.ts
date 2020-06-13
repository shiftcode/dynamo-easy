/**
 * @module expression
 */
import { attributeNameReplacer } from './attribute-name-replacer.function'

/**
 * @hidden
 */
export const BRACED_INDEX_REGEX = /\[(\d+)]/g

/**
 * Creates a unique attribute value placeholder name to use in the expression
 *
 * @returns The unique attribute value placeholder name in respect to the given existing value names (no duplicates allowed)
 * @hidden
 */
export function uniqueAttributeValueName(key: string, existingValueNames?: string[]): string {
  key = key.replace(/\./g, '__').replace(BRACED_INDEX_REGEX, attributeNameReplacer)
  let potentialName = `:${key}`
  let idx = 1

  if (existingValueNames && existingValueNames.length) {
    while (existingValueNames.includes(potentialName)) {
      idx++
      potentialName = `:${key}_${idx}`
    }
  }

  return potentialName
}
