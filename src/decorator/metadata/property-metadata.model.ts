import { MapperForType } from '../../mapper/for-type/base.mapper'

// def good
import * as DynamoDB from 'aws-sdk/clients/dynamodb'
import { Attribute } from '../../mapper/type/attribute.type'
import { ModelConstructor } from '../../model/model-constructor'

export interface TypeInfo {
  type: ModelConstructor<any>
  // true if we use a non native type for dynamo document client
  isCustom?: boolean
  genericType?: ModelConstructor<any>
}

export interface Key {
  type: DynamoDB.KeyType
  uuid?: boolean
}

export interface PropertyMetadata<T, R extends Attribute = Attribute> {
  // this property describes a key attribute (either partition or sort) for the table
  key?: Key

  // name of the property on js side
  name: keyof T

  // name of the dynamodb attribute, same as key by default
  nameDb: string

  /*
   * the type will re resolved using compile time information leveraging the reflect api, due to some limitations we
   * cannot differ between Object, Set, Map and custom Classes so we need an additional @Type decorator
   */
  typeInfo?: TypeInfo

  /*
   * defines which dynamodb type should be used for storing collection data, only L(ist) preserves order (compared to Set types)
   */
  isSortedCollection?: boolean

  mapper?: () => MapperForType<any, R>

  // maps the index name to the key type to describe for which GSI this property describes a key attribute
  keyForGSI?: Record<string, DynamoDB.KeyType>

  // holds all the the index names for which this property describes the sort key attribute
  sortKeyForLSI?: string[]

  // index?: IModelAttributeIndex
  transient?: boolean
}

export function hasGenericType(
  propertyMetadata?: PropertyMetadata<any, any>,
): propertyMetadata is PropertyMetadata<any, any> & { typeInfo: { genericType: ModelConstructor<any> } } {
  return !!(propertyMetadata && propertyMetadata.typeInfo && propertyMetadata.typeInfo.genericType)
}
