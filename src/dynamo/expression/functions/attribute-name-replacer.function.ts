/**
 * @module expression
 */
/**
 * @hidden
 */
export function attributeNameReplacer(_substring: string, ...args: any[]): string {
  return `_at_${args[0]}`
}
