import { AttributeMap } from 'aws-sdk/clients/dynamodb'
import { isDate } from 'lodash-es'
import { PropertyMetadata } from '../../decorator/property-metadata.model'
import { Mapper } from '../../mapper/mapper'
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
    if (isDate(val)) {
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

    let statement
    if (operator === 'IN') {
      // IN filter expression is unlike all the others where val1 is an array of values
      return Expressions.buildInFilterExpression(keyName, value1, existingValueNames)
    } else if (operator === 'BETWEEN') {
      const value2: any | undefined = values[0]
      const v2 = Expressions.formatAttributeValue(value2)
      const v2ValueName = Expressions.uniqAttributeValueName(keyName, [v1ValueName].concat(existingValueNames || []))

      statement = path + ' BETWEEN ' + v1ValueName + ' AND ' + v2ValueName
    } else if (Expressions.isFunctionOperator(operator)) {
      if (value1 !== null && value1 !== undefined) {
        statement = `${operator} (${path}, ${v1ValueName})`
      } else {
        statement = `${operator} (${path})`
      }
    } else {
      statement = [path, operator, v1ValueName].join(' ')
    }

    const attributeMap: AttributeMap = {}

    if (value1 !== null && value1 !== undefined) {
      if (operator === 'contains') {
        // FIXME review concept for this, soooo hacky right now and only supporting dedicated cases
        // if (attributeType instanceof List) {
        // TODO support more types
        // if ((<List<any>>attributeType).listType === 'uniform') {
        //   if ((<List<any>>attributeType).listArguments.type === 'string') {
        //     value1 = { S: value1.toString() };
        //   } else {
        //     throw new Error(`contains expression is not supported for lists with type «uniform» and model type ${(<List<any>>attributeType).listArguments.type}`);
        //   }
        // } else {
        // }
        // } else {
        if (propertyMetadata && propertyMetadata.typeInfo) {
          switch (propertyMetadata.typeInfo.type) {
            case Array:
            case Set:
              break
            default:
              throw new Error(`contains expression is not supported for type ${propertyMetadata.typeInfo.type}`)
          }
        } else {
          throw new Error('no type info defined')
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

  static buildInFilterExpression(key: string, values: string[], existingValueNames?: string[]): Condition {
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

  // TODO implement more checks
  private static validateValues(operator: ConditionOperator, values?: any[]) {
    if (values && Array.isArray(values)) {
      switch (values.length) {
        case 0:
          throw new Error(
            `there is no operator defined where no value is needed, check your code to provide some values for operator ${operator}`
          )
        case 1:
          if (operator === 'BETWEEN') {
            throw new Error('the operator BETWEEN needs two values, just got one')
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
