import { Metadata, PropertyMetadata } from '../../decorator/metadata'
import { Attribute, Attributes, AttributeType, toDbOne } from '../../mapper'
import { deepFilter } from './condition-expression-builder'
import { resolveAttributeNames } from './functions/attribute-names.function'
import { uniqAttributeValueName } from './functions/unique-attribute-value-name.function'
import { UpdateActionDef } from './type/update-action-def'
import { UpdateAction } from './type/update-action.type'
import { UpdateExpression } from './type/update-expression.type'

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
export function buildUpdateExpression(
  attributePath: string,
  operation: UpdateActionDef,
  values: any[],
  existingValueNames: string[] | undefined,
  metadata: Metadata<any> | undefined,
): UpdateExpression {
  // metadata get rid of undefined values
  values = deepFilter(values, value => value !== undefined) || []

  // load property metadata if model metadata was provided
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
  return buildDefaultExpression(
    attributePath,
    resolvedAttributeNames.placeholder,
    valuePlaceholder,
    resolvedAttributeNames.attributeNames,
    values,
    existingValueNames,
    propertyMetadata,
    operation,
  )
}

function buildDefaultExpression(
  attributePath: string,
  namePlaceholder: string,
  valuePlaceholder: string,
  attributeNames: { [key: string]: string },
  values: any[],
  existingValueNames: string[] | undefined,
  propertyMetadata: PropertyMetadata<any> | undefined,
  operator: UpdateActionDef,
): UpdateExpression {

  const attributeValues: Attributes<any> = {}
  let attribute: Attribute | null = null

  if (!isNoAttributeValueAction(operator.action)) {
    attribute = toDbOne(values[0], propertyMetadata)
    if (attribute) {
      attributeValues[valuePlaceholder] = attribute
    }
  }

  let statement: string
  switch (operator.action) {
    case 'incrementBy':
      validateAttributeValue(operator.action, attribute, 'N')
      statement = `${namePlaceholder} = ${namePlaceholder} + ${valuePlaceholder}`
      break
    case 'decrementBy':
      validateAttributeValue(operator.action, attribute, 'N')
      statement = `${namePlaceholder} = ${namePlaceholder} - ${valuePlaceholder}`
      break
    case 'set':
      if (values.length > 1 && !!values[values.length - 1] === true) {
        statement = `${namePlaceholder} = if_not_exists(${namePlaceholder}, ${valuePlaceholder})`
      } else {
        statement = `${namePlaceholder} = ${valuePlaceholder}`
      }
      break
    case 'appendToList':
      if (values.length > 1 && values[values.length - 1] === 'START') {
        statement = `${namePlaceholder} = list_append(${valuePlaceholder}, ${namePlaceholder})`
      } else {
        statement = `${namePlaceholder} = list_append(${namePlaceholder}, ${valuePlaceholder})`
      }
      break
    case 'remove':
      statement = `${namePlaceholder}`
      break
    case 'removeFromListAt':
      statement = values.map(pos => `${namePlaceholder}[${pos}]`).join(', ')
      break
    case 'add':
      validateAttributeValue(operator.action, attribute, 'N', 'SS', 'NS', 'BS')
      statement = `${namePlaceholder} ${valuePlaceholder}`
      break
    case 'removeFromSet':
      validateAttributeValue(operator.action, attribute, 'SS', 'NS', 'BS')
      statement = `${namePlaceholder} ${valuePlaceholder}`
      break
    default:
      throw new Error(`no implementation for action ${operator.action}`)
  }

  return {
    type: operator.actionKeyword,
    statement,
    attributeNames,
    attributeValues,
  }
}

function isNoAttributeValueAction(action: UpdateAction) {
  return (
    action === 'remove' ||
    // special cases: values are used in statement instead of expressionValues
    action === 'removeFromListAt'
  )
}

export function validateAttributeValue(name: string, attributeValue: Attribute | null, ...allowedTypes: AttributeType[]) {
  if (attributeValue === null || attributeValue === undefined) {
    throw new Error(`${name} requires an attributeValue of ${allowedTypes.join(', ')} but non was given`)
  }
  const key = <AttributeType>Object.keys(attributeValue)[0]
  if (!allowedTypes.includes(key)) {
    throw new Error(`Type ${key} of ${JSON.stringify(attributeValue)} is not allowed for ${name}. Valid types are: ${allowedTypes.join('. ')}`)
  }
}
