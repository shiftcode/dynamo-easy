import { Metadata } from '../../decorator/metadata/metadata'
import { PropertyMetadata } from '../../decorator/metadata/property-metadata.model'
import { Mapper } from '../../mapper/mapper'
import { Attribute, Attributes } from '../../mapper/type/attribute.type'
import { Util } from '../../mapper/util'
import { ConditionExpressionBuilder } from './condition-expression-builder'
import { resolveAttributeNames } from './functions/attribute-names.function'
import { uniqAttributeValueName } from './functions/unique-attribute-value-name.function'
import { UpdateActionDef } from './type/update-action-def'
import { UpdateAction } from './type/update-action.type'
import { UpdateExpression } from './type/update-expression.type'

export class UpdateExpressionBuilder {
  /**
   * Will create a condition which can be added to a request using the param object.
   * It will create the expression statement and the attribute names and values.
   *
   * @param {string} attributePath
   * @param {ConditionOperator} operation
   * @param {any[]} values Depending on the operation the amount of values differs
   * @param {string[]} existingValueNames If provided the existing names are used to make sure we have a unique name for the current attributePath
   * @param {Metadata<any>} metadata If provided we use the metadata to define the attribute name and use it to map the given value(s) to attributeValue(s)
   * @returns {Expression}
   */
  static buildUpdateExpression(
    attributePath: string,
    operation: UpdateActionDef,
    values: any[],
    existingValueNames: string[] | undefined,
    metadata: Metadata<any> | undefined
  ): UpdateExpression {
    // TODO LOW:INVESTIGATE is there a use case for undefined desired to be a value
    // get rid of undefined values
    values = ConditionExpressionBuilder.deepFilter(values, value => value !== undefined)

    // TODO check if provided values are valid for given operation
    // ConditionExpressionBuilder.validateValues(operation, values)

    // load property metadat if model metadata was provided
    let propertyMetadata: PropertyMetadata<any> | undefined
    if (metadata) {
      propertyMetadata = metadata.forProperty(attributePath)
    }

    /*
     * resolve placeholder and valuePlaceholder names (same as attributePath if it not already exists)
     * myProp -> #myProp for name placeholder and :myProp for value placeholder
     *
     * person[0] -> #person: person
     * person.list[0].age -> #person: person, #attr: attr, #age: age
     * person.age
     */
    const resolvedAttributeNames = resolveAttributeNames(attributePath, propertyMetadata)
    const valuePlaceholder = uniqAttributeValueName(attributePath, existingValueNames)

    /*
     * build the statement
     */
    // const buildFilterFn: any = curryRight()

    return UpdateExpressionBuilder.buildDefaultExpression(
      attributePath,
      resolvedAttributeNames.placeholder,
      valuePlaceholder,
      resolvedAttributeNames.attributeNames,
      values,
      existingValueNames,
      propertyMetadata,
      operation
    )
  }

  private static buildDefaultExpression(
    attributePath: string,
    namePlaceholder: string,
    valuePlaceholder: string,
    attributeNames: { [key: string]: string },
    values: any[],
    existingValueNames: string[] | undefined,
    propertyMetadata: PropertyMetadata<any> | undefined,
    operator: UpdateActionDef
  ): UpdateExpression {
    let statement: string
    switch (operator.action) {
      case 'incrementBy':
        statement = `${namePlaceholder} = ${namePlaceholder} + ${valuePlaceholder}`
        break
      case 'decrementBy':
        statement = `${namePlaceholder} = ${namePlaceholder} - ${valuePlaceholder}`
        break
      case 'set':
        statement = `${namePlaceholder} = ${valuePlaceholder}`
        break
      case 'appendToList':
        const position = values.length > 1 ? values[values.length - 1] || 'END' : 'END'
        switch (position) {
          case 'END':
            statement = `${namePlaceholder} = list_append(${namePlaceholder}, ${valuePlaceholder})`
            break
          case 'START':
            statement = `${namePlaceholder} = list_append(${valuePlaceholder}, ${namePlaceholder})`
            break
          default:
            throw new Error("make sure to provide either 'START' or 'END' as value for position argument")
        }
        break
      case 'remove':
        statement = `${namePlaceholder}`
        break
      case 'removeFromListAt':
        statement = values.map(pos => `${namePlaceholder}[${pos}]`).join(', ')
        break
      case 'add':
        // TODO add validation to make sure expressionAttributeValue to be N(umber) or S(et)
        statement = `${namePlaceholder} ${valuePlaceholder}`
        // TODO won't work for numbers, is always gonna be mapped to a collection type
        if ((values.length === 1 && Array.isArray(values[0])) || Util.isSet(values[0])) {
          // dealing with arr | set as single argument
        } else {
          // dealing with vararg
          values[0] = [...values]
        }
        break
      case 'removeFromSet':
        // TODO add validation to make sure expressionAttributeValue to be S(et)
        statement = `${namePlaceholder} ${valuePlaceholder}`
        if ((values.length === 1 && Array.isArray(values[0])) || Util.isSet(values[0])) {
          // dealing with arr | set as single argument
        } else {
          // dealing with vararg
          values[0] = [...values]
        }
        break
      default:
        throw new Error(`no implementation for action ${operator.action}`)
    }

    const hasValue = !UpdateExpressionBuilder.isNoValueAction(operator.action)

    const attributes: Attributes = {}
    if (hasValue) {
      const attribute: Attribute | null = Mapper.toDbOne(values[0], propertyMetadata)

      if (attribute) {
        attributes[valuePlaceholder] = attribute
      }
    }

    return {
      type: operator.actionKeyword,
      statement,
      attributeNames,
      attributeValues: attributes,
    }
  }

  private static isNoValueAction(action: UpdateAction) {
    return (
      action === 'remove' ||
      // special cases: values are used in statement instead of expressionValues
      action === 'removeFromListAt'
    )
  }
}
