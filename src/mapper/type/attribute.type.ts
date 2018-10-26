// TODO investigate if we can make Attribute generic, would be useful for Map- / ListAttribute
export type Attribute =
  | StringAttribute
  | NumberAttribute
  | BinaryAttribute
  | StringSetAttribute
  | NumberSetAttribute
  | BinarySetAttribute
  | MapAttribute
  | ListAttribute
  | NullAttribute
  | BooleanAttribute

export type Attributes<T = any> = { [key in keyof T & string]: Attribute }

/**
 * An attribute of type String. For example:  "S": "Hello"
 */
export interface StringAttribute {
  S: string
}

/**
 * An attribute of type Number. For example:  "N": "123.45"  Numbers are sent across the network to DynamoDB as strings, to maximize compatibility across languages and libraries. However, DynamoDB treats them as number type attributes for mathematical operations.
 */
export interface NumberAttribute {
  N: string
}

/**
 * An attribute of type Binary. For example:  "B": "dGhpcyB0ZXh0IGlzIGJhc2U2NC1lbmNvZGVk"
 */
export interface BinaryAttribute {
  B: Buffer | Uint8Array | {} | string
}

/**
 * An attribute of type String Set. For example:  "SS": ["Giraffe", "Hippo" ,"Zebra"]
 */
export interface StringSetAttribute {
  SS: string[]
}

/**
 * An attribute of type Number Set. For example:  "NS": ["42.2", "-19", "7.5", "3.14"]  Numbers are sent across the network to DynamoDB as strings, to maximize compatibility across languages and libraries. However, DynamoDB treats them as number type attributes for mathematical operations.
 */
export interface NumberSetAttribute {
  NS: string[]
}

/**
 * An attribute of type Binary Set. For example:  "BS": ["U3Vubnk=", "UmFpbnk=", "U25vd3k="]
 */
export interface BinarySetAttribute {
  BS: BinaryAttribute[]
}

/**
 * An attribute of type Map. For example:  "M": {"Name": {"S": "Joe"}, "Age": {"N": "35"}}
 */

export interface MapAttribute {
  M: Attributes
}

/**
 * An attribute of type List. For example:  "L": ["Cookies", "Coffee", 3.14159]
 */

export interface ListAttribute {
  L: Attribute[]
}

/**
 * An attribute of type Null. For example:  "NULL": true
 */
export interface NullAttribute {
  NULL: boolean
}

/**
 * An attribute of type Boolean. For example:  "BOOL": true
 */
export interface BooleanAttribute {
  BOOL: boolean
}
