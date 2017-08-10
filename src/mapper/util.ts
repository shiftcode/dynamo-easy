import { AttributeValue } from "aws-sdk/clients/dynamodb"
import { isNumber, isString } from "lodash"
import { AttributeModelTypeName } from "./attribute-model-type.type"
import { AttributeCollectionType, AttributeType } from "./attribute-type.type"

export class Util {
  // FIXME should we handle duplicates, switch from set to list?
  static detectCollectionType(
    collection: any[] | Set<any>
  ): AttributeCollectionType | null {
    if (Array.isArray(collection)) {
      if ((<any[]>collection).every(isString)) {
        return "SS"
      }

      if ((<any[]>collection).every(isNumber)) {
        return "NS"
      }

      if ((<any[]>collection).every(Util.isBinary)) {
        return "BS"
      }

      return "L"
    } else if (Util.isSet(collection)) {
      const firstValueType = (<Set<any>>collection).size
        ? (<Set<any>>collection).values().next().value
        : null
      const type: AttributeType = Util.detectType(firstValueType)

      switch (type) {
        case "S":
          return "SS"
        case "N":
          return "NS"
        case "B":
          return "BS"
        default:
          return "L"
      }
    } else {
      return null
    }
  }

  static isCollection(value: any): boolean {
    return value && (Array.isArray(value) || Util.isSet(value))
  }

  static isSet(value: any): boolean {
    return (
      (value.hasOwnProperty("name") && (<any>value).name === "Set") ||
      value instanceof Set
    )
  }

  // FIXME should we handle duplicates -> switch to L(ist) instead of S(et)
  static detectType(value: any): AttributeType {
    if (Array.isArray(value) || Util.isSet(value)) {
      return Util.detectCollectionType(value)
    } else {
      if (isString(value)) {
        return "S"
      }

      if (isNumber(value)) {
        return "N"
      }

      if (Util.isBinary(value)) {
        return "B"
      }

      if (value === null) {
        return "NULL"
      }

      if (typeof value === "boolean") {
        return "BOOL"
      }

      if (typeof value === "object") {
        return "M"
      }
    }
  }

  /*
   * copied from https://github.com/aws/aws-sdk-js/blob/0c974a7ff6749a541594de584b43a040978d4b72/lib/dynamodb/types.js
   */
  static typeOf(data): AttributeModelTypeName {
    if (data === null && typeof data === "object") {
      return "Null"
    } else if (data !== undefined && Util.isBinary(data)) {
      return "Binary"
    } else if (data !== undefined && data.constructor) {
      return Util.typeName(data.constructor)
    } else if (data !== undefined && typeof data === "object") {
      // this object is the result of Object.create(null), hence the absence of a
      // defined constructor
      return "Object"
    } else {
      return "Undefined"
    }
  }

  static typeOfFromDb(attributeValue: AttributeValue): AttributeModelTypeName {
    let dynamoType: AttributeType = <AttributeType>Object.keys(
      attributeValue
    )[0]
    switch (dynamoType) {
      case "S":
        return "String"
      case "N":
        return "Number"
      case "B":
        return "Binary"
      case "BOOL":
        return "Boolean"
      case "SS":
      case "NS":
      case "BS":
        return "Set"
      case "L":
        return "Array"
      case "NULL":
        return "Null"
    }
  }

  static isBinary(data) {
    if (Util.isNode()) {
      // FIXME should add || data instanceof Stream
      return Buffer.isBuffer(data)
    } else {
      const types = [
        "Buffer",
        "File",
        "Blob",
        "ArrayBuffer",
        "DataView",
        "Int8Array",
        "Uint8Array",
        "Uint8ClampedArray",
        "Int16Array",
        "Uint16Array",
        "Int32Array",
        "Uint32Array",
        "Float32Array",
        "Float64Array"
      ]

      types.forEach(type => {
        if (data !== undefined && data.constructor) {
          if (Util.isType(data, type)) return true
          if (Util.typeName(data.constructor) === type) return true
        }
      })
    }
    return false
  }

  /*
   * copied from https://github.com/aws/aws-sdk-js/blob/0c974a7ff6749a541594de584b43a040978d4b72/lib/util.js
   */
  static isType(obj, type) {
    // handle cross-"frame" objects
    if (typeof type === "function") type = Util.typeName(type)
    return Object.prototype.toString.call(obj) === "[object " + type + "]"
  }

  static isBrowser() {
    return process && (<any>process).browser
  }

  static isNode() {
    return !Util.isBrowser()
  }

  static typeName(type) {
    if (Object.prototype.hasOwnProperty.call(type, "name")) return type.name
    let str = type.toString()
    let match = str.match(/^\s*function (.+)\(/)
    return match ? match[1] : str
  }

  private static test(arr: any[], fn: (arrValue: any) => boolean): boolean {
    return arr.every(fn)
  }
}
