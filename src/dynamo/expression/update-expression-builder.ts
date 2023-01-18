/**
 * @module expression
 */
import { Metadata } from '../../decorator/metadata/metadata'
import {
  alterCollectionPropertyMetadataForSingleItem,
  PropertyMetadata,
} from '../../decorator/metadata/property-metadata.model'
import { toDbOne } from '../../mapper/mapper'
import { AttributeType } from '../../mapper/type/attribute-type.type'
import { Attribute, Attributes } from '../../mapper/type/attribute.type'
import { getPropertyPath, isSet } from '../../mapper/util'
import { deepFilter } from './condition-expression-builder'
import { resolveAttributeNames } from './functions/attribute-names.function'
import { uniqueAttributeValueName } from './functions/unique-attribute-value-name.function'
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
 * @hidden
 */
export function buildUpdateExpression(
  attributePath: string,
  operation: UpdateActionDef,
  values: any[],
  existingValueNames: string[] | undefined,
  metadata: Metadata<any> | undefined,
): UpdateExpression {
  // metadata get rid of undefined values
  values = deepFilter(values, (value) => value !== undefined) || []

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
  const resolvedAttributeNames = resolveAttributeNames(attributePath, metadata)
  const valuePlaceholder = uniqueAttributeValueName(attributePath, existingValueNames)

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

/**
 * @hidden
 */
function buildDefaultExpression(
  attributePath: string,
  namePlaceholder: string,
  valuePlaceholder: string,
  attributeNames: Record<string, string>,
  values: any[],
  _existingValueNames: string[] | undefined,
  propertyMetadata: PropertyMetadata<any> | undefined,
  operator: UpdateActionDef,
): UpdateExpression {
  const attributeValues: Attributes<any> = {}
  let attribute: Attribute | null = null

  if (!isNoAttributeValueAction(operator.action)) {
    // special cases: appendToList, add, removeFromSet
    // we allow to provide arrays or sets for those methods.
    // so it's necessary to make sure appendToList receives Arrays, add & removeFromSet receive Sets
    if (['removeFromSet', 'add'].includes(operator.action) && Array.isArray(values[0])) {
      values[0] = new Set(values[0])
    } else if (['appendToList'].includes(operator.action) && isSet(values[0])) {
      values[0] = [...values[0]]
    }

    // special case: [same as in buildDefaultConditionExpression]
    // we have the metadata for an Array/Set of an Object,
    // but only get a single item when using list indexes in attributePath
    // e.g. `attribute('myCollectionProp[0]').set(...)`
    // (not exclusive to `.set(...)` but all updateActions)
    if (/\[\d+\]$/.test(attributePath)) {
      attribute = toDbOne(
        values[0],
        getPropertyPath(propertyMetadata, attributePath),
        alterCollectionPropertyMetadataForSingleItem(propertyMetadata),
      )
    } else {
      attribute = toDbOne(values[0], propertyMetadata)
    }
    if (attribute) {
      attributeValues[valuePlaceholder] = attribute
    }
  }

  // see update-expression-definition-chain.ts for action definitions
  let statement: string
  switch (operator.action) {
    case 'incrementBy':
      validateAttributeType(operator.action, attribute, 'N')
      statement = `${namePlaceholder} = ${namePlaceholder} + ${valuePlaceholder}`
      break
    case 'decrementBy':
      validateAttributeType(operator.action, attribute, 'N')
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
      statement = values.map((pos) => `${namePlaceholder}[${pos}]`).join(', ')
      break
    case 'add':
      validateAttributeType(operator.action, attribute, 'N', 'SS', 'NS', 'BS')
      statement = `${namePlaceholder} ${valuePlaceholder}`
      break
    case 'removeFromSet':
      validateAttributeType(operator.action, attribute, 'SS', 'NS', 'BS')
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

/**
 * @hidden
 */
function isNoAttributeValueAction(action: UpdateAction) {
  return (
    action === 'remove' ||
    // special cases: values are used in statement instead of expressionValues
    action === 'removeFromListAt'
  )
}

/**
 * @hidden
 */
export function validateAttributeType(name: string, attribute: Attribute | null, ...allowedTypes: AttributeType[]) {
  if (attribute === null || attribute === undefined) {
    throw new Error(`${name} requires an attributeValue of ${allowedTypes.join(', ')} but non was given`)
  }
  const key = <AttributeType>Object.keys(attribute)[0]
  if (!allowedTypes.includes(key)) {
    throw new Error(
      `Type ${key} of ${JSON.stringify(attribute)} is not allowed for ${name}. Valid types are: ${allowedTypes.join(
        '. ',
      )}`,
    )
  }
}
