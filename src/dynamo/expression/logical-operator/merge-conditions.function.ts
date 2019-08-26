/**
 * @module expression
 */
import { Metadata } from '../../../decorator/metadata/metadata'
import { Attribute } from '../../../mapper/type/attribute.type'
import { uniqueAttributeValueName } from '../functions/unique-attribute-value-name.function'
import { ConditionExpressionDefinitionFunction } from '../type/condition-expression-definition-function'
import { Expression } from '../type/expression.type'

/**
 * @hidden
 */
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
      mergedCondition.attributeNames = { ...mergedCondition.attributeNames, ...condition.attributeNames }

      /*
       * we need to make sure the value variable name is unique, this wont' work so the second :name must be renamed
       * {
       *    ":name" : { S: "the name" },
       *    ":name" : { S: "other name" }
       * }
       *                |
       *                |
       *                ▽
       * {
       *    ":name" : { S: "the name" },
       *    ":name_2" : { S: "other name" }
       * }
       *
       */
      const attributeValues: Record<string, Attribute> = {}
      Object.keys(condition.attributeValues).forEach(key => {
        const unique = uniqueAttributeValueName(key.replace(':', ''), Object.keys(mergedCondition.attributeValues))
        if (key !== unique) {
          // rename of the attributeName is required in condition
          condition.statement = condition.statement.replace(key, unique)
        }

        attributeValues[unique] = condition.attributeValues[key]
      })

      mergedCondition.attributeValues = { ...mergedCondition.attributeValues, ...attributeValues }
      statements.push(condition.statement)
    })

    mergedCondition.statement = statements.length === 1 ? statements[0] : `(${statements.join(' ' + operator + ' ')})`
    return mergedCondition
  }
}
