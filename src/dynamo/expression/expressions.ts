import { AttributeMap, AttributeValue } from 'aws-sdk/clients/dynamodb'
import * as _ from 'lodash'
import { Metadata } from '../../decorator/metadata/metadata'
import { PropertyMetadata } from '../../decorator/metadata/property-metadata.model'
import { Mapper } from '../../mapper/mapper'
import { AttributeType } from '../../mapper/type/attribute.type'
import { Binary } from '../../mapper/type/binary.type'
import { Util } from '../../mapper/util'
import { ConditionOperator } from './type/condition-operator.type'
import { Condition } from './type/condition.type'

export class Expressions {
  static isFunctionOperator(operator: ConditionOperator): boolean {
    return [
      'attribute_exists',
      'attribute_not_exists',
      'attribute_type',
      'begins_with',
      'contains',
      'NOT contains',
      'size',
    ].includes(operator)
  }

  static isNoParamFunctionOperator(operator: ConditionOperator): boolean {
    return operator === 'attribute_exists' || operator === 'attribute_not_exists'
  }

  static uniqAttributeValueName(key: string, existingValueNames?: string[]): string {
    let potentialName = `:${key}`
    let idx = 1

    if (existingValueNames && existingValueNames.length) {
      while (existingValueNames.includes(potentialName)) {
        idx++
        potentialName = `:${key}_${idx}`
      }
    }

    return potentialName
  }

  /**
   * Will create a condition which can be added to a request using the param object.
   * It will create the expression statement and the attribute names and values.
   *
   * @param {string} keyName
   * @param {ConditionOperator} operator
   * @param {any[]} values Depending on the operator the amount of values differs
   * @param {string[]} existingValueNames If provided the existing names are used to make sure we have a unique name for the current keyName
   * @param {Metadata<any>} metadata If provided we use the metadata to define the attribute name and use it to map the given value(s) to attributeValue(s)
   * @returns {Condition}
   */
  static buildFilterExpression(
    keyName: string,
    operator: ConditionOperator,
    values: any[],
    existingValueNames: string[] | undefined,
    metadata: Metadata<any> | undefined
  ): Condition {
    // check if provided values are valid for given operator
    Expressions.validateValues(operator, values)

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
    const valuePlaceholder = Expressions.uniqAttributeValueName(keyName, existingValueNames)

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
        // return Expressions.buildInFilterExpression(keyName, value1, existingValueNames, propertyMetadata)
        buildFilterFn = _.curryRight(Expressions.buildInFilterExpression)
        break
      case 'BETWEEN':
        buildFilterFn = _.curryRight(Expressions.buildBetweenFilterExpression)
        buildFilterFn = buildFilterFn(valuePlaceholder)
        break
      default:
        buildFilterFn = _.curryRight(Expressions.buildDefaultFilterExpression)
        buildFilterFn = buildFilterFn(operator, valuePlaceholder)
    }

    return buildFilterFn(keyName, namePlaceholder, attributeNames, values, existingValueNames, propertyMetadata)
  }

  /**
   * IN expression is unlike all the others where the operand is an array of unwrapped values (not attribute values)
   *
   * @param {string} keyName
   * @param {string[]} values
   * @param {string[]} existingValueNames
   * @param {PropertyMetadata<any>} propertyMetadata
   * @returns {Condition}
   */
  private static buildInFilterExpression(
    keyName: string,
    namePlaceholder: string,
    attributeNames: { [key: string]: string },
    values: any[],
    existingValueNames: string[] | undefined,
    propertyMetadata: PropertyMetadata<any> | undefined
  ): Condition {
    const attributeValues = (<any[]>values[0]).reduce(
      (result, value) => {
        const existing = Object.keys(result).concat(existingValueNames || [])
        const valuePlaceholder = Expressions.uniqAttributeValueName(keyName, existing)
        const attributeValue = Mapper.toDbOne(value, propertyMetadata)
        result[valuePlaceholder] = <any>attributeValue[<AttributeType>Object.keys(attributeValue)[0]]
        return result
      },
      <AttributeMap>{}
    )

    return {
      statement: `${namePlaceholder} IN (${Object.keys(attributeValues)})`,
      attributeNames,
      attributeValues,
    }
  }

  private static buildBetweenFilterExpression(
    keyName: string,
    namePlaceholder: string,
    attributeNames: { [key: string]: string },
    values: string[],
    existingValueNames: string[] | undefined,
    propertyMetadata: PropertyMetadata<any> | undefined,
    valuePlaceholder: string
  ): Condition {
    // FIXME is it really an AttributeMap or just plain values with no wrapping?
    const attributeValues: AttributeMap = {}
    const mappedValue1 = Mapper.toDbOne(values[0], propertyMetadata)
    const mappedValue2 = Mapper.toDbOne(values[1], propertyMetadata)

    const value2Placeholder = Expressions.uniqAttributeValueName(
      keyName,
      [valuePlaceholder].concat(existingValueNames || [])
    )

    const statement = `${namePlaceholder} BETWEEN ${valuePlaceholder} AND ${value2Placeholder}`
    attributeValues[valuePlaceholder] = mappedValue1
    attributeValues[value2Placeholder] = mappedValue2

    return {
      statement,
      attributeNames,
      attributeValues,
    }
  }

  private static buildDefaultFilterExpression(
    keyName: string,
    namePlaceholder: string,
    attributeNames: { [key: string]: string },
    values: any[],
    existingValueNames: string[] | undefined,
    propertyMetadata: PropertyMetadata<any> | undefined,
    operator: ConditionOperator,
    valuePlaceholder: string
  ): Condition {
    let statement: string
    let hasValue = true
    if (Expressions.isFunctionOperator(operator)) {
      if (Expressions.isNoParamFunctionOperator(operator)) {
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
          value = Expressions.validateValueForContains(values[0], propertyMetadata)
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

  // TODO implement more checks
  private static validateValues(operator: ConditionOperator, values?: any[]) {
    if (values && Array.isArray(values)) {
      switch (values.length) {
        case 0:
          if (!Expressions.isNoParamFunctionOperator(operator)) {
            throw new Error(
              `got 0 values for operator ${operator}, this is not the right amount of arguments for this operator`
            )
          }
          break
        case 1:
          if (
            operator !== '=' &&
            operator !== '>' &&
            operator !== '>=' &&
            operator !== '<' &&
            operator !== '<=' &&
            operator !== '<>' &&
            operator !== 'begins_with' &&
            operator !== 'attribute_type' &&
            operator !== 'contains' &&
            operator !== 'IN'
          ) {
            throw new Error(
              `got 1 value for operator ${operator}, this is not the right amount of arguments for this operator`
            )
          }

          // operand must be a String for operator contains
          if (operator === 'contains') {
            const type = Util.typeOf(values[0])
            // if (type !== String || type !== Number || type !== Binary) {
            //   throw new Error(`the operator contains only supports String, Number, Binary got ${type}`)
            // }
          }

          break
        case 2:
          if (operator !== 'BETWEEN') {
            throw new Error(
              `got 2 values for operator ${operator}, this is not the right amount of arguments for this operator`
            )
          }

          if (operator === 'BETWEEN') {
            // values must be the same type
            if (Util.typeOf(values[0]) !== Util.typeOf(values[1])) {
              throw new Error(
                `both values for operator BETWEEN must have the same type, got ${Util.typeOf(
                  values[0]
                )} and ${Util.typeOf(values[1])}`
              )
            }
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
