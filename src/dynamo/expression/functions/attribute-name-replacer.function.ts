/**
 * @module expression
 */
/**
 * @hidden
 */
export function attributeNameReplacer(substring: string, ...args: any[]): string {
  return `_at_${args[0]}`
}
