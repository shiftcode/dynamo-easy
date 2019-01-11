import { isNumber, isString } from 'lodash'
import { AttributeCollectionType, AttributeType } from './type/attribute-type.type'
import { AttributeValueType } from './type/attribute-value-type.type'
import { Attribute } from './type/attribute.type'
import { Binary } from './type/binary.type'
import { NullType } from './type/null.type'
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

/**
 * Detects the dynamoDB type to which an collection value should be mapped. Empty collections will be mapped to L(ist).
 * Collections of type array where all the values are either String | Number | Binary will be mapped to the corresponding S(et)
 * type. If the item types are heterogeneous or it is a non supported set type the returned type will be L(ist).
 * The logic for collection fo type Set is the same.
 *
 * @param {any[] | Set<any>} collection
 * @returns {AttributeCollectionType}
 */
export function detectCollectionType(collection: any[] | Set<any>): AttributeCollectionType {
  if (Array.isArray(collection)) {
    if (collection.length) {
      if (collection.every(isString)) {
        return 'SS'
      }

      if (collection.every(isNumber)) {
        return 'NS'
      }

      if (collection.every(isBinary)) {
        return 'BS'
      }
    }

    return 'L'
  } else if (isSet(collection)) {
    const firstValueType: AttributeType | null = collection.size ? detectType(collection.values().next().value) : null
    let heterogeneous = false

    for (const item of collection) {
      const type: AttributeType = detectType(item)
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

export function isCollection(value: any): boolean {
  return value && (Array.isArray(value) || isSet(value))
}

export function isSet(value: any): value is Set<any> {
  return (
    (value !== null && value !== undefined && value.hasOwnProperty('name') && value.name === 'Set') ||
    value instanceof Set
  )
}

export function detectType(value: any): AttributeType {
  if (isCollection(value)) {
    return detectCollectionType(value)
  } else {
    if (isString(value)) {
      return 'S'
    }

    if (isNumber(value)) {
      return 'N'
    }

    if (isBinary(value)) {
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
export function typeOf(data: any): AttributeValueType {
  if (data === null) {
    return NullType
  } else {
    if (Array.isArray(data)) {
      return Array
    } else if (data instanceof Set) {
      return Set
    } else if (data instanceof Map) {
      return Map
    } else if (isBinary(data)) {
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
export function typeOfFromDb(attributeValue?: Attribute): AttributeValueType {
  if (attributeValue) {
    const dynamoType: AttributeType = <AttributeType>Object.keys(attributeValue)[0]
    switch (dynamoType) {
      case 'S':
        return String
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

export function isBinary(data: any): boolean {
  if (isNode()) {
    // TODO LOW:BINARY should add || data instanceof Stream
    return Buffer.isBuffer(data)
  } else {
    return BUFFER_TYPES.some(
      type => data !== undefined && data.constructor && (isType(data, type) || typeName(data.constructor) === type),
    )
  }
}

export function isBufferType(type: any): boolean {
  return BUFFER_TYPES.includes(type)
}

/*
 * copied from https://github.com/aws/aws-sdk-js/blob/0c974a7ff6749a541594de584b43a040978d4b72/lib/js
 */
export function isType(obj: any, type: any): boolean {
  // handle cross-"frame" objects
  if (typeof type === 'function') {
    type = typeName(type)
  }

  return Object.prototype.toString.call(obj) === '[object ' + type + ']'
}

export function isBrowser() {
  return process && (<any>process).browser
}

export function isNode() {
  return !isBrowser()
}

/**
 * Returns the name of the given Type. null and undefined are special cases were we return 'Null' vs. 'Undefined'
 * @param type
 * @returns {string}
 */
export function typeName(type: any): 'Null' | 'Undefined' | string {
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
