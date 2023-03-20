// tslint:disable:interface-over-type-literal
/*
 * holds different types which are no longer available in aws-sdk v3, might be inlined at some point. Open to discuss.
 * TODO v3: discuss how to proceed
 */
import { AttributeValue, KeysAndAttributes, WriteRequest } from '@aws-sdk/client-dynamodb'
export type BatchGetRequestMap = { [key: string]: KeysAndAttributes }
export type BatchWriteItemRequestMap = { [key: string]: WriteRequest[] }

export type ExpressionAttributeNameMap = { [key: string]: string /* was: AttributeName */ }
export type ExpressionAttributeValueMap = { [key: string]: AttributeValue /* was: AttributeValue */ }

export type AttributeMap = { [key: string]: AttributeValue }

export type Key = { [key: string]: AttributeValue }

// FIXME somehow the import of KeyType from @aws-sdk/client-dynamodb does not work at runtime
export enum KeyType {
  HASH = 'HASH',
  RANGE = 'RANGE',
}
