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
 * @returns {string} The unique attribute value placeholder name in respect to the given existing value names (no duplicates allowed)
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

export function uniqueAttributeValueNameRecord(key: string, existingValueNames?: Record<string, string>): string {
  key = key.replace(/\./g, '__').replace(BRACED_INDEX_REGEX, attributeNameReplacer)
  let potentialName = `:${key}`
  let idx = 1

  if (existingValueNames && existingValueNames.length) {
    const recordKeys = Object.keys(existingValueNames)
    const recordValues = Object.values(existingValueNames)
    while (recordKeys.includes(potentialName) || recordValues.includes(potentialName)) {
      idx++
      potentialName = `:${key}_${idx}`
    }
  }

  return potentialName
}
