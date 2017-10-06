import { AttributeMap, AttributeValue } from 'aws-sdk/clients/dynamodb'
import { curryRight } from 'lodash'
import { Metadata } from '../../decorator/metadata/metadata'
import { PropertyMetadata } from '../../decorator/metadata/property-metadata.model'
import { Mapper } from '../../mapper/mapper'
import { resolveAttributeNames } from './functions/attribute-names.function'
import { isFunctionOperator } from './functions/is-function-operator.function'
import { isNoParamFunctionOperator } from './functions/is-no-param-function-operator.function'
import { uniqAttributeValueName } from './functions/unique-attribute-value-name.function'
import { Expression } from './type/expression.type'
import { UpdateAction, UpdateActionDef } from './type/update-action.type'
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
    // TODO investigate is there a use case for undefined desired to be a value
    // get rid of undefined values
    values = values.filter(value => value !== undefined)

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
      case 'set':
        statement = `${namePlaceholder} = ${valuePlaceholder}`
        break
      case 'incrementBy':
        statement = `${namePlaceholder} = ${namePlaceholder} + ${valuePlaceholder}`
        break
      case 'decrementBy':
        statement = `${namePlaceholder} = ${namePlaceholder} - ${valuePlaceholder}`
        break
      default:
        throw new Error('no implementation')
    }

    // = [namePlaceholder, operator, valuePlaceholder].join(' ')
    // FIXME add hasValue logic
    const hasValue = true

    const attributeValues: AttributeMap = {}
    if (hasValue) {
      const value: AttributeValue | null = Mapper.toDbOne(values[0], propertyMetadata)

      if (value) {
        attributeValues[valuePlaceholder] = value
      }
    }

    return {
      type: operator.actionKeyword,
      statement,
      attributeNames,
      attributeValues,
    }
  }
}
