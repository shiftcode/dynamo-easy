// TODO: I'd say this dynamic template function could be replaced with specific functions like x = (a,b)=>`${a}

/**
 * @module expression
 */

/**
 * @hidden
 */
export function dynamicTemplate(templateString: string, templateVariables: Record<string, any>) {
  const keys = Object.keys(templateVariables)
  const values = Object.values(templateVariables)
  /* eslint-disable-next-line no-new-func */
  const templateFunction = new Function(...keys, `return \`${templateString}\`;`)
  return templateFunction(...values)
}
