import { curryRight, forEach, isPlainObject } from 'lodash'
import { Metadata } from '../../decorator/metadata/metadata'
import { PropertyMetadata } from '../../decorator/metadata/property-metadata.model'
import { toDbOne, typeOf } from '../../mapper'
import { Attribute, Attributes } from '../../mapper/type/attribute.type'
import { resolveAttributeNames } from './functions/attribute-names.function'
import { isFunctionOperator } from './functions/is-function-operator.function'
import { isNoParamFunctionOperator } from './functions/is-no-param-function-operator.function'
import { operatorParameterArity } from './functions/operator-parameter-arity.function'
import { uniqAttributeValueName } from './functions/unique-attribute-value-name.function'
import { ConditionOperator } from './type/condition-operator.type'
import { Expression } from './type/expression.type'

/**
 * see http://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.ConditionExpressions.html
 * https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_Condition.html
 */

/**
 * Will walk the object tree recursively and removes all items which do not satisfy the filterFn
 * @param obj
 * @param {(value: any) => boolean} filterFn
 * @returns {any}
 */
export function deepFilter(obj: any, filterFn: (value: any) => boolean): any | null {
  if (Array.isArray(obj)) {
    const returnArr: any[] = []
    obj.forEach(i => {
      const item = deepFilter(i, filterFn)
      if (item !== null) {
        returnArr.push(item)
      }
    })

    return returnArr.length ? returnArr : null
  } else if (obj instanceof Set) {
    const returnArr: any[] = []
    Array.from(obj).forEach(i => {
      const item = deepFilter(i, filterFn)
      if (item !== null) {
        returnArr.push(item)
      }
    })

    return returnArr.length ? new Set(returnArr) : null
  } else if (isPlainObject(obj)) {
    const returnObj: { [key: string]: any } = {}

    forEach(obj, (value: any, key: string) => {
      const item = deepFilter(value, filterFn)
      if (item !== null) {
        returnObj[key] = item
      }
    })

    return Object.keys(returnObj).length ? returnObj : null
  } else {
    if (filterFn(obj)) {
      return obj
    } else {
      return null
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
 */
export function buildFilterExpression(
  attributePath: string,
  operator: ConditionOperator,
  values: any[],
  existingValueNames: string[] | undefined,
  metadata: Metadata<any> | undefined,
): Expression {
  // TODO LOW:INVESTIGATE is there a use case for undefined desired to be a value
  // metadata rid of undefined values
  values = deepFilter(values, value => value !== undefined)

  // check if provided values are valid for given operator
  validateValues(operator, values)

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
  let buildFilterFn: any
  switch (operator) {
    case 'IN':
      buildFilterFn = curryRight(buildInConditionExpression)
      break
    case 'BETWEEN':
      buildFilterFn = curryRight(buildBetweenConditionExpression)
      break
    default:
      buildFilterFn = curryRight(buildDefaultConditionExpression)
      buildFilterFn = buildFilterFn(operator)
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
 */
function buildInConditionExpression(
  attributePath: string,
  namePlaceholder: string,
  valuePlaceholder: string,
  attributeNames: { [key: string]: string },
  values: any[],
  existingValueNames: string[] | undefined,
  propertyMetadata: PropertyMetadata<any> | undefined,
): Expression {
  const attributeValues: Attributes<any> = (<any[]>values[0])
    .map(value => toDbOne(value, propertyMetadata))
    .reduce(
      (result, mappedValue: Attribute | null, index: number) => {
        if (mappedValue !== null) {
          result[`${valuePlaceholder}_${index}`] = mappedValue
        }
        return result
      },
      <Attributes<any>>{},
    )

  const inStatement = (<any[]>values[0]).map((value: any, index: number) => `${valuePlaceholder}_${index}`).join(', ')

  return {
    statement: `${namePlaceholder} IN (${inStatement})`,
    attributeNames,
    attributeValues,
  }
}

function buildBetweenConditionExpression(
  attributePath: string,
  namePlaceholder: string,
  valuePlaceholder: string,
  attributeNames: { [key: string]: string },
  values: string[],
  existingValueNames: string[] | undefined,
  propertyMetadata: PropertyMetadata<any> | undefined,
): Expression {
  const attributes: Attributes<any> = {}
  const mappedValue1 = toDbOne(values[0], propertyMetadata)
  const mappedValue2 = toDbOne(values[1], propertyMetadata)

  if (mappedValue1 === null || mappedValue2 === null) {
    throw new Error('make sure to provide an actual value for te BETWEEN operator')
  }

  const value2Placeholder = uniqAttributeValueName(attributePath, [valuePlaceholder].concat(existingValueNames || []))

  const statement = `${namePlaceholder} BETWEEN ${valuePlaceholder} AND ${value2Placeholder}`
  attributes[valuePlaceholder] = mappedValue1
  attributes[value2Placeholder] = mappedValue2

  return {
    statement,
    attributeNames,
    attributeValues: attributes,
  }
}

function buildDefaultConditionExpression(
  attributePath: string,
  namePlaceholder: string,
  valuePlaceholder: string,
  attributeNames: { [key: string]: string },
  values: any[],
  existingValueNames: string[] | undefined,
  propertyMetadata: PropertyMetadata<any> | undefined,
  operator: ConditionOperator,
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

  const attributes: Attributes<any> = {}
  if (hasValue) {
    let attribute: Attribute | null
    switch (operator) {
      case 'contains':
        // TODO think about validation
        // validateValueForContains(values[0], propertyMetadata)
        attribute = toDbOne(values[0], propertyMetadata)
        break
      default:
        attribute = toDbOne(values[0], propertyMetadata)
    }

    if (attribute) {
      attributes[valuePlaceholder] = attribute
    }
  }

  return {
    statement,
    attributeNames,
    attributeValues: attributes,
  }
}

/**
 * Every operator requires a predefined arity of parameters, this method checks for the correct arity and throws an Error
 * if not correct
 *
 * @param {any[]} values The values which will be applied to the operator function implementation
 * @throws {Error} error Throws an error if the amount of values won't match the operator function parameter arity or
 * the given values is not an array
 */
function validateValues(operator: ConditionOperator, values?: any[]) {
  const parameterArity = operatorParameterArity(operator)
  if (values === null || values === undefined) {
    if (isFunctionOperator(operator) && !isNoParamFunctionOperator(operator)) {
      // the operator needs some values to work
      throw new Error(
        `expected ${parameterArity} value(s) for operator ${operator}, this is not the right amount of method parameters for this operator`,
      )
    }
  } else if (values && Array.isArray(values)) {
    // check for correct amount of values
    if (values.length !== parameterArity) {
      switch (operator) {
        case 'IN':
          throw new Error(
            `expected ${parameterArity} value(s) for operator ${operator}, this is not the right amount of method parameters for this operator (IN operator requires one value of array type)`,
          )
        default:
          throw new Error(
            `expected ${parameterArity} value(s) for operator ${operator}, this is not the right amount of method parameters for this operator`,
          )
      }
    }

    // some additional operator dependent validation
    switch (operator) {
      case 'BETWEEN':
        // values must be the same type
        if (typeOf(values[0]) !== typeOf(values[1])) {
          throw new Error(
            `both values for operator BETWEEN must have the same type, got ${typeOf(values[0])} and ${typeOf(
              values[1],
            )}`,
          )
        }
        break
      case 'IN':
        if (!Array.isArray(values[0])) {
          throw new Error('the provided value for IN operator must be an array')
        }
    }
  }
}

// TODO should we support other types than String, Number, Binary (can we search a boolean set for example with boolean as string?)
// private static validateValueForContains(value: any, propertyMetadata?: PropertyMetadata<any>): { S: string } {
//   let finalValue: { S: string }
//   if (propertyMetadata && propertyMetadata.typeInfo) {
//     switch (propertyMetadata.typeInfo.type) {
//       case Array:
//       case Set:
//         // FIXME REVIEW the validation logic
//         // const genericType = propertyMetadata.typeInfo.genericType
//         // if ((!genericType && (typeof value === 'number' || typeof value === 'string' || typeof value === '')) || (
//         //   genericType &&
//         //   genericType !== String &&
//         //   genericType !== Number &&
//         //   genericType !== Binary)
//         // ) {
//         finalValue = { S: value.toString() }
//         // } else {
//         //   throw new Error(
//         //     'either generic type info is not defined or the generic type is not one of String, Number, Binary',
//         //   )
//         // }
//         break
//       case String:
//       case Number:
//       case Binary:
//         finalValue = { S: value.toString() }
//         break
//       default:
//         throw new Error(`contains expression is not supported for type ${propertyMetadata.typeInfo.type}`)
//     }
//   } else {
//     // no explicit type defined -> try to detect the type from value
//     const type = Util.typeOf(value)
//     if (type === String || type === Number || type === Binary) {
//       finalValue = { S: value.toString() }
//     } else {
//       throw new Error(`contains expression is not supported for type ${type}`)
//     }
//   }
//
//   return finalValue
// }
