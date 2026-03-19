/**
 * @module expression
 */

/**
 * @hidden
 */
export function dynamicTemplate(templateString: string, templateVariables: Record<string, any>) {
  const keys = Object.keys(templateVariables)
  const values = Object.values(templateVariables)
  // eslint-disable-next-line @typescript-eslint/no-implied-eval
  const templateFunction = new Function(...keys, `return \`${templateString}\`;`)
  return templateFunction(...values)
}
