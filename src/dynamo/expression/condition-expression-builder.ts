/**
 * @module expression
 */
import { Metadata } from '../../decorator/metadata/metadata'
import {
  alterCollectionPropertyMetadataForSingleItem,
  PropertyMetadata,
} from '../../decorator/metadata/property-metadata.model'
import { curry } from '../../helper/curry.function'
import { isPlainObject } from '../../helper/is-plain-object.function'
import { toDbOne } from '../../mapper/mapper'
import { Attribute, Attributes } from '../../mapper/type/attribute.type'
import { typeOf } from '../../mapper/util'
import { resolveAttributeNames } from './functions/attribute-names.function'
import { isFunctionOperator } from './functions/is-function-operator.function'
import { isNoParamFunctionOperator } from './functions/is-no-param-function-operator.function'
import { operatorParameterArity } from './functions/operator-parameter-arity.function'
import { uniqueAttributeValueName } from './functions/unique-attribute-value-name.function'
import { ConditionOperator } from './type/condition-operator.type'
import { Expression } from './type/expression.type'
import { validateAttributeType } from './update-expression-builder'
import { dynamicTemplate } from './util'

/**
 * @hidden
 */
type BuildFilterFn = (
  attributePath: string,
  namePlaceholder: string,
  valuePlaceholder: string,
  attributeNames: Record<string, string>,
  values: any[],
  existingValueNames: string[] | undefined,
  propertyMetadata: PropertyMetadata<any> | undefined,
) => Expression

/**
 * see http://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.ConditionExpressions.html
 * https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_Condition.html
 */

/**
 * Will walk the object tree recursively and removes all items which do not satisfy the filterFn
 * @param obj
 * @param {(value: any) => boolean} filterFn
 * @returns {any}
 * @hidden
 */
export function deepFilter(obj: any, filterFn: (value: any) => boolean): any {
  if (Array.isArray(obj)) {
    const returnArr: any[] = []
    obj.forEach((i) => {
      const item = deepFilter(i, filterFn)
      if (item !== undefined) {
        returnArr.push(item)
      }
    })

    return returnArr
  } else if (obj instanceof Set) {
    const returnArr: any[] = []
    Array.from(obj).forEach((i) => {
      const item = deepFilter(i, filterFn)
      if (item !== undefined) {
        returnArr.push(item)
      }
    })

    return new Set(returnArr)
  } else if (isPlainObject(obj)) {
    const returnObj: Record<string, any> = {}

    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key]
        const item = deepFilter(value, filterFn)
        if (item !== undefined) {
          returnObj[key] = item
        }
      }
    }

    return returnObj
  } else {
    if (filterFn(obj)) {
      return obj
    } else {
      return undefined
    }
  }
}

/**
 * Will create a condition which can be added to a request using the param object.
 * It will create the expression statement and the attribute names and values.
 *
 * @param {string} attributePath
 * @param {ConditionOperator} operator
 * @param {any[]} values Depending on the operator the amount of values differs
 * @param {string[]} existingValueNames If provided the existing names are used to make sure we have a unique name for the current attributePath
 * @param {Metadata<any>} metadata If provided we use the metadata to define the attribute name and use it to map the given value(s) to attributeValue(s)
 * @returns {Expression}
 * @hidden
 */
export function buildFilterExpression(
  attributePath: string,
  operator: ConditionOperator,
  values: any[],
  existingValueNames: string[] | undefined,
  metadata: Metadata<any> | undefined,
): Expression {
  // metadata get rid of undefined values
  values = deepFilter(values, (value) => value !== undefined)

  // check if provided values are valid for given operator
  validateForOperator(operator, values)

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
  let buildFilterFn: BuildFilterFn

  switch (operator) {
    case 'IN':
      buildFilterFn = buildInConditionExpression
      break
    case 'BETWEEN':
      buildFilterFn = buildBetweenConditionExpression
      break
    default:
      buildFilterFn = curry(buildDefaultConditionExpression)(operator)
  }

  return buildFilterFn(
    attributePath,
    resolvedAttributeNames.placeholder,
    valuePlaceholder,
    resolvedAttributeNames.attributeNames,
    values,
    existingValueNames,
    propertyMetadata,
  )
}

/**
 * IN expression is unlike all the others property the operand is an array of unwrapped values (not attribute values)
 *
 * @param {string} attributePath
 * @param {string[]} values
 * @param {string[]} existingValueNames
 * @param {PropertyMetadata<any>} propertyMetadata
 * @returns {Expression}
 * @hidden
 */
function buildInConditionExpression(
  _attributePath: string,
  namePlaceholder: string,
  valuePlaceholder: string,
  attributeNames: Record<string, string>,
  values: any[],
  _existingValueNames: string[] | undefined,
  propertyMetadata: PropertyMetadata<any> | undefined,
): Expression {
  const attributeValues: Attributes<any> = (<any[]>values[0])
    .map((value) => toDbOne(value, propertyMetadata))
    .reduce((result, mappedValue: Attribute | null, index: number) => {
      if (mappedValue !== null) {
        validateAttributeType('IN condition', mappedValue, 'S', 'N', 'B')
        result[`${valuePlaceholder}_${index}`] = mappedValue
      }
      return result
    }, <Attributes<any>>{})

  const inStatement = (<any[]>values[0]).map((_value: any, index: number) => `${valuePlaceholder}_${index}`).join(', ')

  return {
    statement: `${namePlaceholder} IN (${inStatement})`,
    attributeNames,
    attributeValues,
  }
}

/**
 * @hidden
 */
function buildBetweenConditionExpression(
  attributePath: string,
  namePlaceholder: string,
  valuePlaceholder: string,
  attributeNames: Record<string, string>,
  values: string[],
  existingValueNames: string[] | undefined,
  propertyMetadata: PropertyMetadata<any> | undefined,
): Expression {
  const attributeValues: Attributes<any> = {}
  const mappedValue1 = toDbOne(values[0], propertyMetadata)
  const mappedValue2 = toDbOne(values[1], propertyMetadata)

  if (mappedValue1 === null || mappedValue2 === null) {
    throw new Error('make sure to provide an actual value for te BETWEEN operator')
  }
  ;[mappedValue1, mappedValue2].forEach((mv) => validateAttributeType('between', mv, 'S', 'N', 'B'))

  const value2Placeholder = uniqueAttributeValueName(attributePath, [valuePlaceholder].concat(existingValueNames || []))

  const statement = `${namePlaceholder} BETWEEN ${valuePlaceholder} AND ${value2Placeholder}`
  attributeValues[valuePlaceholder] = mappedValue1
  attributeValues[value2Placeholder] = mappedValue2

  return {
    statement,
    attributeNames,
    attributeValues,
  }
}

/**
 * @hidden
 */
function buildDefaultConditionExpression(
  operator: ConditionOperator,
  _attributePath: string,
  namePlaceholder: string,
  valuePlaceholder: string,
  attributeNames: Record<string, string>,
  values: any[],
  _exisingValueNames: string[] | undefined,
  propertyMetadata: PropertyMetadata<any> | undefined,
): Expression {
  let statement: string
  let hasValue = true
  if (isFunctionOperator(operator)) {
    if (isNoParamFunctionOperator(operator)) {
      statement = `${operator} (${namePlaceholder})`
      hasValue = false
    } else {
      statement = `${operator} (${namePlaceholder}, ${valuePlaceholder})`
    }
  } else {
    statement = [namePlaceholder, operator, valuePlaceholder].join(' ')
  }

  const attributeValues: Attributes<any> = {}
  if (hasValue) {
    let attribute: Attribute | null
    if (operator === 'contains' || operator === 'not_contains') {
      attribute = toDbOne(values[0], alterCollectionPropertyMetadataForSingleItem(propertyMetadata))
      validateAttributeType(`${operator} condition`, attribute, 'N', 'S', 'B')
    } else {
      attribute = toDbOne(values[0], propertyMetadata)
      switch (operator) {
        case 'begins_with':
          validateAttributeType(`${operator} condition`, attribute, 'S', 'B')
          break
        case '<':
        case '<=':
        case '>':
        case '>=':
          validateAttributeType(`${operator} condition`, attribute, 'N', 'S', 'B')
          break
      }
    }

    if (attribute) {
      attributeValues[valuePlaceholder] = attribute
    }
  }

  return {
    statement,
    attributeNames,
    attributeValues,
  }
}

/**
 * Every operator requires a predefined arity of parameters, this method checks for the correct arity and throws an Error
 * if not correct
 *
 * @param operator
 * @param values The values which will be applied to the operator function implementation, not every operator requires values
 * @throws {Error} error Throws an error if the amount of values won't match the operator function parameter arity or
 * the given values is not an array
 * @hidden
 */
function validateForOperator(operator: ConditionOperator, values?: any[]) {
  validateArity(operator, values)

  /*
   * validate values if operator supports values
   */
  if (!isFunctionOperator(operator) || (isFunctionOperator(operator) && !isNoParamFunctionOperator(operator))) {
    if (values && Array.isArray(values) && values.length) {
      validateValues(operator, values)
    } else {
      throw new Error(
        dynamicTemplate(ERR_ARITY_DEFAULT, { parameterArity: operatorParameterArity(operator), operator }),
      )
    }
  }
}

// tslint:disable:no-invalid-template-strings
/*
 * error messages for arity issues
 */
/**
 * @hidden
 */
export const ERR_ARITY_IN =
  'expected ${parameterArity} value(s) for operator ${operator}, this is not the right amount of method parameters for this operator (IN operator requires one value of array type)'

/**
 * @hidden
 */
export const ERR_ARITY_DEFAULT =
  'expected ${parameterArity} value(s) for operator ${operator}, this is not the right amount of method parameters for this operator'

// tslint:enable:no-invalid-template-strings
/**
 * @hidden
 */
function validateArity(operator: ConditionOperator, values?: any[]) {
  if (values === null || values === undefined) {
    if (isFunctionOperator(operator) && !isNoParamFunctionOperator(operator)) {
      // the operator needs some values to work
      throw new Error(
        dynamicTemplate(ERR_ARITY_DEFAULT, { parameterArity: operatorParameterArity(operator), operator }),
      )
    }
  } else if (values && Array.isArray(values)) {
    const parameterArity = operatorParameterArity(operator)
    // check for correct amount of values
    if (values.length !== parameterArity) {
      switch (operator) {
        case 'IN':
          throw new Error(dynamicTemplate(ERR_ARITY_IN, { parameterArity, operator }))
        default:
          throw new Error(dynamicTemplate(ERR_ARITY_DEFAULT, { parameterArity, operator }))
      }
    }
  }
}

/*
 * error message for wrong operator values
 */
// tslint:disable:no-invalid-template-strings
/**
 * @hidden
 */
export const ERR_VALUES_BETWEEN_TYPE =
  'both values for operator BETWEEN must have the same type, got ${value1} and ${value2}'
/**
 * @hidden
 */
export const ERR_VALUES_IN = 'the provided value for IN operator must be an array'

// tslint:enable:no-invalid-template-strings

/**
 * Every operator has some constraints about the values it supports, this method makes sure everything is fine for given
 * operator and values
 * @hidden
 */
function validateValues(operator: ConditionOperator, values: any[]) {
  // some additional operator dependent validation
  switch (operator) {
    case 'BETWEEN':
      // values must be the same type
      if (typeOf(values[0]) !== typeOf(values[1])) {
        throw new Error(
          dynamicTemplate(ERR_VALUES_BETWEEN_TYPE, { value1: typeOf(values[0]), value2: typeOf(values[1]) }),
        )
      }
      break
    case 'IN':
      if (!Array.isArray(values[0])) {
        throw new Error(ERR_VALUES_IN)
      }
  }
}
