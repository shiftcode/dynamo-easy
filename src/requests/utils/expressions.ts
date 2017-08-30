import { AttributeMap } from 'aws-sdk/clients/dynamodb'
import * as _ from 'lodash'
import { Binary } from '../../decorator/binary.type'
import { PropertyMetadata } from '../../decorator/property-metadata.model'
import { Mapper } from '../../mapper/mapper'
import { Util } from '../../mapper/util'
import { ConditionOperator } from './condition-operator.type'
import { Condition } from './condition.model'

export class Expressions {
  static actionWords = ['SET', 'ADD', 'REMOVE', 'DELETE']

  static functionOperators = [
    'attribute_exists',
    'attribute_not_exists',
    'attribute_type',
    'begins_with',
    'contains',
    'NOT contains',
    'size',
  ]

  static regexMap = Expressions.actionWords.reduce((result: { [key: string]: RegExp }, actionWord) => {
    result[actionWord] = new RegExp(actionWord + '\\s*(.+?)\\s*(SET|ADD|REMOVE|DELETE|$)')
    return result
  }, {})

  // explanation http://stackoverflow.com/questions/3428618/regex-to-find-commas-that-arent-inside-and
  static splitOperandsRegex = new RegExp(/\s*(?![^(]*\)),\s*/)

  static match(actionWord: string, str: string) {
    const match = Expressions.regexMap[actionWord].exec(str)

    if (match && match.length >= 2) {
      return match[1].split(Expressions.splitOperandsRegex)
    } else {
      return null
    }
  }

  static formatAttributeValue(val: any): any {
    if (_.isDate(val)) {
      return val.toISOString()
    }

    return val
  }

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

  static buildFilterExpression(
    keyName: string,
    operator: ConditionOperator,
    values: any[],
    existingValueNames?: string[],
    propertyMetadata?: PropertyMetadata<any>
  ): Condition {
    Expressions.validateValues(operator, values)

    const path = `#${keyName}`
    let value1: any = values[0]
    const v1ValueName = Expressions.uniqAttributeValueName(keyName, existingValueNames)

    const attributeMap: AttributeMap = {}
    let statement

    /*
     * build the statement
     */
    if (operator === 'IN') {
      // IN filter expression is unlike all the others where val1 is an array of values
      return Expressions.buildInFilterExpression(keyName, value1, existingValueNames)
    } else if (operator === 'BETWEEN') {
      return Expressions.buildBetweenFilterExpression(keyName, v1ValueName, value1, values[1], existingValueNames)
    } else if (Expressions.isFunctionOperator(operator)) {
      if (value1 !== null && value1 !== undefined) {
        statement = `${operator} (${path}, ${v1ValueName})`
      } else {
        statement = `${operator} (${path})`
      }
    } else {
      statement = [path, operator, v1ValueName].join(' ')
    }

    if (value1 !== null && value1 !== undefined) {
      if (operator === 'contains') {
        // TODO should we support other types than String, Number, Binary (can we search a boolean set for example with boolean as string?)
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
                value1 = { S: value1.toString() }
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
          const type = Util.typeOf(value1)
          if (type === String || type === Number || type === Binary) {
            value1 = { S: value1.toString() }
          } else {
            throw new Error(`contains expression is not supported for type ${type}`)
          }
        }
      } else {
        value1 = Mapper.toDbOne(value1, propertyMetadata)
      }

      attributeMap[v1ValueName] = value1
    }

    // if (!_.isNull(v2) && !_.isUndefined(v2)) {
    //   v2 = Mapper.toDbOne(v2, propertyMetadata)
    //   attributeMap[v2ValueName] = v2
    // }

    const attributeNames: { [key: string]: string } = {}
    attributeNames[path] = keyName

    return {
      attributeNames,
      statement,
      attributeMap,
    }
  }

  private static buildInFilterExpression(key: string, values: string[], existingValueNames?: string[]): Condition {
    const path = `#${key}`

    const attributeNames: { [key: string]: string } = {}
    attributeNames[path] = key

    const attributeMap = values.reduce((result: AttributeMap, val) => {
      const existing = Object.keys(result).concat(existingValueNames || [])
      const p = Expressions.uniqAttributeValueName(key, existing)
      result[p] = Expressions.formatAttributeValue(val)
      return result
    }, {})

    return {
      attributeNames,
      attributeMap,
      statement: `${path} IN (${Object.keys(attributeMap)})`,
    }
  }

  private static buildBetweenFilterExpression(
    key: string,
    v1ValueName: string,
    value1: any,
    value2: any,
    existingValueNames?: string[]
  ): Condition {
    const path = `#${key}`
    const attributeNames: { [key: string]: string } = {}
    attributeNames[path] = key
    // FIXME is it really an AttributeMap or just plain values with no wrapping?
    const attributeMap: AttributeMap = {}
    const v1 = Expressions.formatAttributeValue(value1)
    const v2 = Expressions.formatAttributeValue(value2)

    const v2ValueName = Expressions.uniqAttributeValueName(key, [v1ValueName].concat(existingValueNames || []))

    const statement = `${path} BETWEEN ${v1ValueName} AND ${v2ValueName}`
    attributeMap[v1ValueName] = v1
    attributeMap[v2ValueName] = v2

    return {
      attributeNames,
      attributeMap,
      statement,
    }
  }

  // TODO implement more checks
  private static validateValues(operator: ConditionOperator, values?: any[]) {
    if (values && Array.isArray(values)) {
      switch (values.length) {
        case 0:
          if (operator !== 'attribute_exists' && operator !== 'attribute_not_exists' && operator !== 'size') {
            throw new Error(
              `there is no operator defined where no value is needed, check your code to provide some values for operator ${operator}`
            )
          }
          break
        case 1:
          if (operator === 'BETWEEN') {
            throw new Error('the operator BETWEEN needs two values, just got one')
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
          if (operator === '<' || operator === '>') {
            throw new Error(`the operator ${operator} needs one value, got two`)
          }
          break
      }
    } else {
      throw new Error('values must be of type Array')
    }
  }
}
