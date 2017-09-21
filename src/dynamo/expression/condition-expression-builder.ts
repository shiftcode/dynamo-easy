import { AttributeMap, AttributeValue } from 'aws-sdk/clients/dynamodb'
import { curryRight, values as objValues } from 'lodash'
import { Metadata } from '../../decorator/metadata/metadata'
import { PropertyMetadata } from '../../decorator/metadata/property-metadata.model'
import { Mapper } from '../../mapper/mapper'
import { Binary } from '../../mapper/type/binary.type'
import { Util } from '../../mapper/util'
import { isFunctionOperator } from './functions/is-function-operator.function'
import { isNoParamFunctionOperator } from './functions/is-no-param-function-operator.function'
import { operatorParameterArity } from './functions/operator-parameter-arity.function'
import { uniqAttributeValueName } from './functions/unique-attribute-value-name.function'
import { ConditionExpression } from './type/condition-expression.type'
import { ConditionOperator } from './type/condition-operator.type'

/**
 * TODO complete doc
 * see http://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.ConditionExpressions.html
 */
export class ConditionExpressionBuilder {
  /**
   * Will create a condition which can be added to a request using the param object.
   * It will create the expression statement and the attribute names and values.
   *
   * @param {string} keyName
   * @param {ConditionOperator} operator
   * @param {any[]} values Depending on the operator the amount of values differs
   * @param {string[]} existingValueNames If provided the existing names are used to make sure we have a unique name for the current keyName
   * @param {Metadata<any>} metadata If provided we use the metadata to define the attribute name and use it to map the given value(s) to attributeValue(s)
   * @returns {ConditionExpression}
   */
  static buildFilterExpression(
    keyName: string,
    operator: ConditionOperator,
    values: any[],
    existingValueNames: string[] | undefined,
    metadata: Metadata<any> | undefined
  ): ConditionExpression {
    // TODO investigate is there a use case for undefined desired to be a value
    // get rid of undefined values
    values = values.filter(value => value !== undefined)

    // check if provided values are valid for given operator
    ConditionExpressionBuilder.validateValues(operator, values)

    // load property metadat if model metadata was provided
    let propertyMetadata: PropertyMetadata<any> | undefined
    if (metadata) {
      propertyMetadata = metadata.forProperty(keyName)
    }

    /*
     * resolve placeholder and valuePlaceholder names (same as keyName if it not already exists)
     * myProp -> #myProp for name placeholder and :myProp for value placeholder
     */
    const namePlaceholder = `#${keyName}`
    const valuePlaceholder = uniqAttributeValueName(keyName, existingValueNames)

    const attributeNames: { [key: string]: string } = {}
    let finalKeyName: string
    if (propertyMetadata) {
      finalKeyName = propertyMetadata.nameDb
    } else {
      finalKeyName = keyName
    }

    attributeNames[namePlaceholder] = finalKeyName

    /*
     * build the statement
     */
    let buildFilterFn: any
    switch (operator) {
      case 'IN':
        // return ConditionExpressionBuilder.buildInConditionExpression(keyName, value1, existingValueNames, propertyMetadata)
        buildFilterFn = curryRight(ConditionExpressionBuilder.buildInConditionExpression)
        buildFilterFn = buildFilterFn(valuePlaceholder)
        break
      case 'BETWEEN':
        buildFilterFn = curryRight(ConditionExpressionBuilder.buildBetweenConditionExpression)
        buildFilterFn = buildFilterFn(valuePlaceholder)
        break
      default:
        buildFilterFn = curryRight(ConditionExpressionBuilder.buildDefaultConditionExpression)
        buildFilterFn = buildFilterFn(operator, valuePlaceholder)
    }

    return buildFilterFn(keyName, namePlaceholder, attributeNames, values, existingValueNames, propertyMetadata)
  }

  /**
   * IN expression is unlike all the others property the operand is an array of unwrapped values (not attribute values)
   *
   * @param {string} keyName
   * @param {string[]} values
   * @param {string[]} existingValueNames
   * @param {PropertyMetadata<any>} propertyMetadata
   * @returns {ConditionExpression}
   */
  private static buildInConditionExpression(
    keyName: string,
    namePlaceholder: string,
    attributeNames: { [key: string]: string },
    values: any[],
    existingValueNames: string[] | undefined,
    propertyMetadata: PropertyMetadata<any> | undefined,
    valuePlaceholder: string
  ): ConditionExpression {
    const mappedValues = (<any[]>values[0]).map(value => {
      return Mapper.toDbOne(value, propertyMetadata)
    })

    const attributeValues: AttributeMap = {}
    attributeValues[valuePlaceholder] = { L: <any>mappedValues }

    // (<any[]>values[0]).reduce(
    //   (result, value) => {
    //     const existing = Object.keys(result).concat(existingValueNames || [])
    //     const valuePlaceholder = uniqAttributeValueName(keyName, existing)
    //     const attributeValue = Mapper.toDbOne(value, propertyMetadata)
    //     result[valuePlaceholder] = <any>attributeValue[<AttributeType>Object.keys(attributeValue)[0]]
    //     return result
    //   },
    //   <AttributeMap>{}
    // )

    return {
      statement: `${namePlaceholder} IN (${Object.keys(attributeValues)})`,
      attributeNames,
      attributeValues,
    }
  }

  private static buildBetweenConditionExpression(
    keyName: string,
    namePlaceholder: string,
    attributeNames: { [key: string]: string },
    values: string[],
    existingValueNames: string[] | undefined,
    propertyMetadata: PropertyMetadata<any> | undefined,
    valuePlaceholder: string
  ): ConditionExpression {
    const attributeValues: AttributeMap = {}
    const mappedValue1 = Mapper.toDbOne(values[0], propertyMetadata)
    const mappedValue2 = Mapper.toDbOne(values[1], propertyMetadata)

    const value2Placeholder = uniqAttributeValueName(keyName, [valuePlaceholder].concat(existingValueNames || []))

    const statement = `${namePlaceholder} BETWEEN ${valuePlaceholder} AND ${value2Placeholder}`
    attributeValues[valuePlaceholder] = mappedValue1
    attributeValues[value2Placeholder] = mappedValue2

    return {
      statement,
      attributeNames,
      attributeValues,
    }
  }

  private static buildDefaultConditionExpression(
    keyName: string,
    namePlaceholder: string,
    attributeNames: { [key: string]: string },
    values: any[],
    existingValueNames: string[] | undefined,
    propertyMetadata: PropertyMetadata<any> | undefined,
    operator: ConditionOperator,
    valuePlaceholder: string
  ): ConditionExpression {
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

    const attributeValues: AttributeMap = {}
    if (hasValue) {
      let value: AttributeValue
      switch (operator) {
        case 'contains':
          value = ConditionExpressionBuilder.validateValueForContains(values[0], propertyMetadata)
          break
        default:
          value = Mapper.toDbOne(values[0], propertyMetadata)
      }

      attributeValues[valuePlaceholder] = value
    }

    return {
      statement,
      attributeNames,
      attributeValues,
    }
  }

  /**
   * TODO if propertyMetadata is available we could add some type check for example with operator IN the given values should all have the same type like the attribute
   * which should be checked
   *
   * Every operator requires a predefined arity of parameters, this method checks for the correct arity and throws an Error
   * if not correct
   *
   * @param {ConditionOperator} operator
   * @param {any[]} values The values which will be applied to the operator function implementation
   * @throws {Error} error Throws an error if the amount of values won't match the operator function parameter arity or
   * the given values is not an array
   */
  private static validateValues(operator: ConditionOperator, values?: any[]) {
    if (values && Array.isArray(values)) {
      // check for correct amount of values
      const parameterArity = operatorParameterArity(operator)
      if (values.length !== parameterArity) {
        switch (operator) {
          case 'IN':
            throw new Error(
              `expected ${parameterArity} value(s) for operator ${operator}, this is not the right amount of method parameters for this operator (IN operator requires one value of array type)`
            )
          default:
            throw new Error(
              `expected ${parameterArity} value(s) for operator ${operator}, this is not the right amount of method parameters for this operator`
            )
        }
      }

      // some additional operator dependent validation
      switch (operator) {
        case 'BETWEEN':
          // values must be the same type
          if (Util.typeOf(values[0]) !== Util.typeOf(values[1])) {
            throw new Error(
              `both values for operator BETWEEN must have the same type, got ${Util.typeOf(
                values[0]
              )} and ${Util.typeOf(values[1])}`
            )
          }
          break
      }
    } else {
      throw new Error('values must be of type Array')
    }
  }

  // TODO should we support other types than String, Number, Binary (can we search a boolean set for example with boolean as string?)
  private static validateValueForContains(value: any, propertyMetadata?: PropertyMetadata<any>): { S: string } {
    let finalValue: { S: string }
    if (propertyMetadata && propertyMetadata.typeInfo) {
      switch (propertyMetadata.typeInfo.type) {
        case Array:
        case Set:
          if (
            propertyMetadata.typeInfo.genericTypes &&
            propertyMetadata.typeInfo.genericTypes[0] !== String &&
            propertyMetadata.typeInfo.genericTypes[0] !== Number &&
            propertyMetadata.typeInfo.genericTypes[0] !== Binary
          ) {
            finalValue = { S: value.toString() }
          } else {
            throw new Error(
              'either generic type info is not defined or the generic type is not one of String, Number, Binary'
            )
          }
          break
        default:
          throw new Error(`contains expression is not supported for type ${propertyMetadata.typeInfo.type}`)
      }
    } else {
      // no explicit type defined -> try to detect the type from value
      const type = Util.typeOf(value)
      if (type === String || type === Number || type === Binary) {
        finalValue = { S: value.toString() }
      } else {
        throw new Error(`contains expression is not supported for type ${type}`)
      }
    }

    return finalValue
  }
}
