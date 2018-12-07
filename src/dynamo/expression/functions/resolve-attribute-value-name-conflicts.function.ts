import { Attributes } from '../../../mapper'
import { ConditionalParams } from '../../operation-params.type'
import { Expression } from '../type/expression.type'
import { uniqAttributeValueName } from './unique-attribute-value-name.function'

/**
 * resolves name conflict when expression uses an attributeValueName that is already used in given *Input
 * @param expression
 * @param params
 * @return safe-to-use Expression
 */
export function resolveAttributeValueNameConflicts(
  expression: Expression,
  params: ConditionalParams,
): Expression {
  let attributeValues: Attributes<any> = {}
  let statement: string = expression.statement

  if (params.ExpressionAttributeValues) {
    const existingAttributeValueNames = Object.keys(params.ExpressionAttributeValues)
    Object.keys(expression.attributeValues)
      .map(key => [key, uniqAttributeValueName(key.replace(':', ''), existingAttributeValueNames)])
      .forEach(([oldValName, newValName]) => {
        attributeValues[newValName] = expression.attributeValues[oldValName]
        // split-join based replaceAll
        statement = statement.split(oldValName).join(newValName)
      })
  } else {
    attributeValues = expression.attributeValues
  }

  return { ...expression, attributeValues, statement }
}
