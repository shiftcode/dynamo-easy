/**
 * @module expression
 */

/**
 * @hidden
 */
export function dynamicTemplate(templateString: string, templateVariables: Record<string, any>) {
  const keys = Object.keys(templateVariables)
  const values = Object.values(templateVariables)
  // tslint:disable-next-line:function-constructor
  const templateFunction = new Function(...keys, `return \`${templateString}\`;`)
  return templateFunction(...values)
}
