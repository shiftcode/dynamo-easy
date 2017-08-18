import { AttributeValue } from 'aws-sdk/clients/dynamodb'
import { isNumber, isString } from 'lodash'
import moment from 'moment'
import { Binary } from '../decorator/binary.type'
import { Moment } from '../decorator/moment.type'
import { AttributeModelType } from './attribute-model-type.type'
import { AttributeCollectionType, AttributeType } from './attribute-type.type'
import { NullType } from './null.type'
import { UndefinedType } from './undefined.type'

export type TypesByConvention = 'date'

export class Util {
  static REGEX_CONVENTIONS: { [key in TypesByConvention]: RegExp } = {
    date: /^(?:date|[\w]+(?:Date|At)(?:[A-Z]{1}[\w]+)?)$/,
  }

  // tslint:disable-next-line:max-line-length
  static DATE_TIME_ISO8601 = /^(?:[1-9]\d{3}-(?:(?:0[1-9]|1[0-2])-(?:0[1-9]|1\d|2[0-8])|(?:0[13-9]|1[0-2])-(?:29|30)|(?:0[13578]|1[02])-31)|(?:[1-9]\d(?:0[48]|[2468][048]|[13579][26])|(?:[2468][048]|[13579][26])00)-02-29)T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:Z|[+-][01]\d:[0-5]\d)$/

  // TODO should we handle duplicates, switch from set to list?
  static detectCollectionType(collection: any[] | Set<any>): AttributeCollectionType | null {
    if (Array.isArray(collection)) {
      if (collection.every(isString)) {
        return 'SS'
      }

      if (collection.every(isNumber)) {
        return 'NS'
      }

      if (collection.every(Util.isBinary)) {
        return 'BS'
      }

      return 'L'
    } else if (Util.isSet(collection)) {
      const firstValueType = collection.size ? collection.values().next().value : null
      const type: AttributeType = Util.detectType(firstValueType)

      switch (type) {
        case 'S':
          return 'SS'
        case 'N':
          return 'NS'
        case 'B':
          return 'BS'
        default:
          return 'L'
      }
    } else {
      return null
    }
  }

  static typeByConvention(propertyKey: string): TypesByConvention | undefined {
    let type: TypesByConvention
    Object.keys(Util.REGEX_CONVENTIONS).forEach(key => {
      if (Util.REGEX_CONVENTIONS[key].test(propertyKey)) {
        type = <TypesByConvention>key
      }
    })

    return type
  }

  static isCollection(value: any): boolean {
    return value && (Array.isArray(value) || Util.isSet(value))
  }

  static isSet(value: any): value is Set<any> {
    return (
      (value !== null && value !== undefined && value.hasOwnProperty('name') && (<any>value).name === 'Set') ||
      value instanceof Set
    )
  }

  // FIXME should we handle duplicates -> switch to L(ist) instead of S(et)
  static detectType(value: any): AttributeType {
    if (Util.isCollection(value)) {
      return Util.detectCollectionType(value)
    } else {
      if (isString(value)) {
        return 'S'
      }

      if (isNumber(value)) {
        return 'N'
      }

      if (Util.isBinary(value)) {
        return 'B'
      }

      if (value === null) {
        return 'NULL'
      }

      if (typeof value === 'boolean') {
        return 'BOOL'
      }

      if (typeof value === 'object') {
        return 'M'
      }
    }
  }

  /**
   * Will resolve the type based on given data.
   *
   * @param data
   * @returns {AttributeModelTypeName}
   */
  static typeOf(data: any): AttributeModelType {
    if (data === null) {
      return NullType
    } else {
      if (Array.isArray(data)) {
        return Array
      } else if (data instanceof Set) {
        return Set
      } else if (data instanceof Map) {
        return Map
      } else if (data instanceof Date) {
        return Date
      } else if (moment.isMoment(data)) {
        return Moment
      } else if (Util.isBinary(data)) {
        return Binary
      } else {
        switch (typeof data) {
          case 'string':
            return String
          case 'number':
            return Number
          case 'boolean':
            return Boolean
          case 'undefined':
            return UndefinedType
          case 'object':
            return Object
        }
      }
    }
  }

  /*
   * copied from https://github.com/aws/aws-sdk-js/blob/0c974a7ff6749a541594de584b43a040978d4b72/lib/dynamodb/types.js
   * should we work with string match
   */
  static typeOfFromDb(attributeValue: AttributeValue): AttributeModelType | null {
    if (attributeValue) {
      const dynamoType: AttributeType = <AttributeType>Object.keys(attributeValue)[0]
      switch (dynamoType) {
        case 'S':
          if (Util.DATE_TIME_ISO8601.test(attributeValue.S)) {
            return Moment
          } else {
            return String
          }
        case 'N':
          return Number
        case 'B':
          return Binary
        case 'BOOL':
          return Boolean
        case 'SS':
        case 'NS':
        case 'BS':
          return Set
        case 'L':
          return Array
        case 'M':
          return Object
        case 'NULL':
          return NullType
      }
    }

    return null
  }

  static isBinary(data): boolean {
    if (Util.isNode()) {
      // FIXME should add || data instanceof Stream
      return Buffer.isBuffer(data)
    } else {
      const types = [
        'Buffer',
        'File',
        'Blob',
        'ArrayBuffer',
        'DataView',
        'Int8Array',
        'Uint8Array',
        'Uint8ClampedArray',
        'Int16Array',
        'Uint16Array',
        'Int32Array',
        'Uint32Array',
        'Float32Array',
        'Float64Array',
      ]

      types.forEach(type => {
        if (data !== undefined && data.constructor) {
          if (Util.isType(data, type)) {
            return true
          } else if (Util.typeName(data.constructor) === type) {
            return true
          }
        }
      })
    }
    return false
  }

  /*
   * copied from https://github.com/aws/aws-sdk-js/blob/0c974a7ff6749a541594de584b43a040978d4b72/lib/util.js
   */
  static isType(obj, type): boolean {
    // handle cross-"frame" objects
    if (typeof type === 'function') {
      type = Util.typeName(type)
    }

    return Object.prototype.toString.call(obj) === '[object ' + type + ']'
  }

  static isBrowser() {
    return process && (<any>process).browser
  }

  static isNode() {
    return !Util.isBrowser()
  }

  /**
   * Returns the name of the given Type. null and undefined are special cases were we return 'Null' vs. 'Undefined'
   * @param type
   * @returns {string}
   */
  static typeName(type: any): 'Null' | 'Undefined' | string {
    if (type !== null && type !== undefined) {
      if (Object.prototype.hasOwnProperty.call(type, 'name')) {
        return type.name
      } else {
        const str = type.toString()
        const match = str.match(/^\s*function (.+)\(/)
        return match ? match[1] : str
      }
    } else {
      if (type === null) {
        return 'Null'
      } else if (type === undefined) {
        return 'Undefined'
      }
    }
  }
}
