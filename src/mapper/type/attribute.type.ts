import * as DynamoDB from '@aws-sdk/client-dynamodb'

/**
 * @module mapper
 */
export type Attribute =
  | StringAttribute
  | NumberAttribute
  | BinaryAttribute
  | StringSetAttribute
  | NumberSetAttribute
  | BinarySetAttribute
  | MapAttribute
  | ListAttribute<any>
  | NullAttribute
  | BooleanAttribute
  | $UnknownAttribute

/**
 * the key is either a key of the object T or any string to support for custom property
 * names @Property({name: 'myOtherName'}) and the value is one of Attribute
 * (we can't narrow the type of Attribute)
 */
export type Attributes<T = {}> = Record<keyof T | string, Attribute>

export type StringAttribute = DynamoDB.AttributeValue.SMember
export type NumberAttribute = DynamoDB.AttributeValue.NMember
export type BinaryAttribute = DynamoDB.AttributeValue.BMember
export type StringSetAttribute = DynamoDB.AttributeValue.SSMember
export type NumberSetAttribute = DynamoDB.AttributeValue.NSMember
export type BinarySetAttribute = DynamoDB.AttributeValue.BSMember
export type NullAttribute = DynamoDB.AttributeValue.NULLMember
export type BooleanAttribute = DynamoDB.AttributeValue.BOOLMember
export type $UnknownAttribute = DynamoDB.AttributeValue.$UnknownMember

export interface MapAttribute<T = {}> {
  M: Attributes<T>
}

/**
 * An attribute of type List. For example:  "L": ["Cookies", "Coffee", 3.14159]
 */

export interface ListAttribute<T extends Attribute = Attribute> {
  L: T[]
}
