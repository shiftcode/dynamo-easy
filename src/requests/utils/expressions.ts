import { AttributeMap, AttributeValue } from 'aws-sdk/clients/dynamodb'
import * as _ from 'lodash'
import { PropertyMetadata } from '../../decorator/property-metadata.model'
import { AttributeModelType } from '../../mapper/attribute-model-type.type'
import { Mapper } from '../../mapper/mapper'
import { ConditionOperator } from './condition-operator.type'
import { Condition } from './condition.model'

export class Expressions {
  static actionWords = ['SET', 'ADD', 'REMOVE', 'DELETE']

  static functionOperators = ['attribute_exists', 'attribute_not_exists', 'attribute_type', 'begins_with', 'contains', 'NOT contains', 'size']

  static regexMap = <{ [key: string]: RegExp }>_.reduce(
    Expressions.actionWords,
    (result: { [key: string]: RegExp }, actionWord) => {
      result[actionWord] = new RegExp(actionWord + '\\s*(.+?)\\s*(SET|ADD|REMOVE|DELETE|$)')
      return result
    },
    {}
  )

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
    return _.includes(['attribute_exists', 'attribute_not_exists', 'attribute_type', 'begins_with', 'contains', 'NOT contains', 'size'], operator)
  }

  static uniqAttributeValueName(key: string, existingValueNames: string[]): string {
    let potentialName = ':' + key
    let idx = 1

    while (_.includes(existingValueNames, potentialName)) {
      idx++
      potentialName = ':' + key + '_' + idx
    }

    return potentialName
  }

  static buildFilterExpression(
    keyName: string,
    propertyMetadata: PropertyMetadata<any>,
    operator: ConditionOperator,
    existingValueNames: string[],
    value1: any,
    value2?: any
  ): Condition {
    // IN filter expression is unlike all the others where val1 is an array of values
    if (operator === 'IN') {
      return Expressions.buildInFilterExpression(keyName, existingValueNames, value1)
    }

    let v1 = Expressions.formatAttributeValue(value1)
    let v2 = Expressions.formatAttributeValue(value2)

    const path: string = '#' + keyName
    const v1ValueName = Expressions.uniqAttributeValueName(keyName, existingValueNames)
    const v2ValueName = Expressions.uniqAttributeValueName(keyName, [v1ValueName].concat(existingValueNames))

    let statement = ''

    if (Expressions.isFunctionOperator(operator)) {
      if (!_.isNull(v1) && !_.isUndefined(v1)) {
        statement = operator + '(' + path + ', ' + v1ValueName + ')'
      } else {
        statement = operator + '(' + path + ')'
      }
    } else if (operator === 'BETWEEN') {
      statement = path + ' BETWEEN ' + v1ValueName + ' AND ' + v2ValueName
    } else {
      statement = [path, operator, v1ValueName].join(' ')
    }

    const attributeMap: AttributeMap = {}

    if (!_.isNull(v1) && !_.isUndefined(v1)) {
      if (operator === 'contains') {
        // FIXME review concept for this, soooo hacky right now and only supporting dedicated cases
        // if (attributeType instanceof List) {
        // TODO support more types
        // if ((<List<any>>attributeType).listType === 'uniform') {
        //   if ((<List<any>>attributeType).listArguments.type === 'string') {
        //     v1 = { S: v1.toString() };
        //   } else {
        //     throw new Error(`contains expression is not supported for lists with type «uniform» and model type ${(<List<any>>attributeType).listArguments.type}`);
        //   }
        // } else {
        // }
        // } else {
        switch (propertyMetadata.typeInfo.type) {
          case Array:
          case Set:
            break
          default:
            throw new Error(`contains expression is not supported for type ${propertyMetadata.typeInfo.type}`)
        }
      } else {
        v1 = Mapper.toDbOne(v1, propertyMetadata)
      }

      attributeMap[v1ValueName] = v1
    }

    if (!_.isNull(v2) && !_.isUndefined(v2)) {
      v2 = Mapper.toDbOne(v2, propertyMetadata)
      attributeMap[v2ValueName] = v2
    }

    const attributeNames: { [key: string]: string } = {}
    attributeNames[path] = keyName

    return {
      attributeNames,
      statement,
      attributeMap,
    }
  }

  static buildInFilterExpression(key: string, existingValueNames: string[], values: string[]): Condition {
    const path = '#' + key

    const attributeNames: { [key: string]: string } = {}
    attributeNames[path] = key

    const attributeMap: AttributeMap = <{ [key: string]: AttributeValue }>_.reduce(
      values,
      (result: { [key: string]: string }, val) => {
        const existing = _.keys(result).concat(existingValueNames)
        const p = Expressions.uniqAttributeValueName(key, existing)
        result[p] = Expressions.formatAttributeValue(val)
        return result
      },
      {}
    )

    return {
      attributeNames,
      attributeMap,
      statement: path + ' IN (' + _.keys(attributeMap) + ')',
    }
  }
}
