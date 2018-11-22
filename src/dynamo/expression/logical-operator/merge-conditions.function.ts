import { mapKeys } from 'lodash'
import { Metadata } from '../../../decorator/metadata/metadata'
import { uniqAttributeValueName } from '../functions/unique-attribute-value-name.function'
import { ConditionExpressionDefinitionFunction } from '../type/condition-expression-definition-function'
import { Expression } from '../type/expression.type'

export function mergeConditions(
  operator: 'AND' | 'OR',
  conditionDefinitionFns: ConditionExpressionDefinitionFunction[],
): ConditionExpressionDefinitionFunction {
  return (expressionAttributeValues: string[] | undefined, metadata: Metadata<any> | undefined): Expression => {
    const mergedCondition: Expression = {
      statement: '',
      attributeNames: {},
      attributeValues: {},
    }

    const statements: string[] = []
    conditionDefinitionFns.forEach(conditionDefinitionFn => {
      // we can reuse the same for multiple conditions
      const condition = conditionDefinitionFn(expressionAttributeValues, metadata)
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
}
