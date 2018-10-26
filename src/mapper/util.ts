import { isNumber, isString } from 'lodash'
import { isMoment } from 'moment'
import { AttributeCollectionType, AttributeType } from './type/attribute-type.type'
import { AttributeValueType } from './type/attribute-value-type.type'
import { Attribute, StringAttribute } from './type/attribute.type'
import { Binary } from './type/binary.type'
import { MomentType } from './type/moment.type'
import { NullType } from './type/null.type'
import { TypesByConvention } from './type/types-by-convention.type'
import { UndefinedType } from './type/undefined.type'

const BUFFER_TYPES = [
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

export class Util {
  static REGEX_CONVENTIONS: { [key in TypesByConvention]: RegExp } = {
    date: /^(?:date|[\w]+(?:Date|At)(?:[A-Z]{1}[\w]+)?)$/,
  }

  // tslint:disable-next-line:max-line-length
  static DATE_TIME_ISO8601 = /^(?:[1-9]\d{3}-(?:(?:0[1-9]|1[0-2])-(?:0[1-9]|1\d|2[0-8])|(?:0[13-9]|1[0-2])-(?:29|30)|(?:0[13578]|1[02])-31)|(?:[1-9]\d(?:0[48]|[2468][048]|[13579][26])|(?:[2468][048]|[13579][26])00)-02-29)T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:Z|[+-][01]\d:[0-5]\d)$/

  /**
   * Detects the dynamodb type to which an collection value should be mapped. Empty collections will be mapped to L(ist).
   * Collections of type array where all the values are either String | Number | Binary will be mapped to the corresponding S(et)
   * type. If the item types are heterogeneous or it is a non supported set type the returned type will be L(ist).
   * The logic for collection fo type Set is the same.
   *
   * @param {any[] | Set<any>} collection
   * @returns {AttributeCollectionType}
   */
  static detectCollectionType(collection: any[] | Set<any>): AttributeCollectionType {
    if (Array.isArray(collection)) {
      if (collection.length) {
        if (collection.every(isString)) {
          return 'SS'
        }

        if (collection.every(isNumber)) {
          return 'NS'
        }

        if (collection.every(Util.isBinary)) {
          return 'BS'
        }
      }

      return 'L'
    } else if (Util.isSet(collection)) {
      const firstValueType: AttributeType | null = collection.size
        ? Util.detectType(collection.values().next().value)
        : null
      let heterogeneous = false

      for (const item of collection) {
        const type: AttributeType = Util.detectType(item)
        if (type !== firstValueType) {
          heterogeneous = true
          break
        }
      }

      if (heterogeneous) {
        return 'L'
      } else {
        switch (firstValueType) {
          case 'S':
            return 'SS'
          case 'N':
            return 'NS'
          case 'B':
            return 'BS'
          default:
            return 'L'
        }
      }
    } else {
      throw new Error('given collection was no array or Set -> type could not be detected')
    }
  }

  static typeByConvention(propertyKey: string): TypesByConvention | undefined {
    let type: TypesByConvention | undefined
    Object.keys(Util.REGEX_CONVENTIONS).forEach(key => {
      if (Util.REGEX_CONVENTIONS[<TypesByConvention>key].test(propertyKey)) {
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

    throw new Error(`the type for value ${value} could not be detected`)
  }

  /**
   * Will resolve the type based on given data.
   *
   * @param data
   * @returns {AttributeModelTypeName}
   */
  static typeOf(data: any): AttributeValueType {
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
      } else if (isMoment(data)) {
        return MomentType
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

    throw new Error(`typeof data ${data} could not be detected`)
  }

  /*
   * copied from https://github.com/aws/aws-sdk-js/blob/0c974a7ff6749a541594de584b43a040978d4b72/lib/dynamodb/types.js
   * should we work with string match
   */
  static typeOfFromDb(attributeValue?: Attribute): AttributeValueType {
    if (attributeValue) {
      const dynamoType: AttributeType = <AttributeType>Object.keys(attributeValue)[0]
      switch (dynamoType) {
        case 'S':
          if (Util.DATE_TIME_ISO8601.test((<StringAttribute>attributeValue).S)) {
            return MomentType
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

    throw new Error(`could not resolve the dynamo db type for attribute value ${attributeValue}`)
  }

  static isBinary(data: any): boolean {
    if (Util.isNode()) {
      // TODO LOW:BINARY should add || data instanceof Stream
      return Buffer.isBuffer(data)
    } else {
      return BUFFER_TYPES.some(
        type =>
          data !== undefined &&
          data.constructor &&
          (Util.isType(data, type) || Util.typeName(data.constructor) === type)
      )
    }
  }

  static isBufferType(type: any): boolean {
    return BUFFER_TYPES.includes(type)
  }

  /*
   * copied from https://github.com/aws/aws-sdk-js/blob/0c974a7ff6749a541594de584b43a040978d4b72/lib/util.js
   */
  static isType(obj: any, type: any): boolean {
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

    throw new Error(`was not able to resolve type name for type ${type}`)
  }

  // FIXME UUID replace with a more bullet proof implementation node uuid module requires crypto, need to figure out how to use it with browser
  static uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      // tslint:disable
      let r = (Math.random() * 16) | 0,
        v = c == 'x' ? r : (r & 0x3) | 0x8
      return v.toString(16)
    })
  }
}
