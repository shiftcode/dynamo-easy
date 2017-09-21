import { mapKeys } from 'lodash'
import { ConditionExpressionBuilder } from '../condition-expression-builder'
import { uniqAttributeValueName } from '../functions/unique-attribute-value-name.function'
import { ConditionExpression } from '../type/condition-expression.type'

export function mergeConditions(operator: 'AND' | 'OR', conditions: ConditionExpression[]): ConditionExpression {
  const mergedCondition: ConditionExpression = {
    statement: '',
    attributeNames: {},
    attributeValues: {},
  }

  const statements: string[] = []
  conditions.forEach(condition => {
    // we can reuse the same for multiple conditions
    Object.assign(mergedCondition.attributeNames, condition.attributeNames)

    // we need to make sure the value variable name is unique
    const attributeValues = mapKeys(condition.attributeValues, (value, key) => {
      const unique = uniqAttributeValueName(key.replace(':', ''), Object.keys(mergedCondition.attributeValues))
      if (key !== unique) {
        condition.statement = condition.statement.replace(key, unique)
      }

      return unique
    })

    Object.assign(mergedCondition.attributeValues, attributeValues)
    statements.push(condition.statement)
  })

  mergedCondition.statement = `(${statements.join(' ' + operator + ' ')})`
  return mergedCondition
}
