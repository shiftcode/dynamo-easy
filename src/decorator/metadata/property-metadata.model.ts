/**
 * @module metadata
 */
import * as DynamoDB from '@aws-sdk/client-dynamodb'
import { MapperForType } from '../../mapper/for-type/base.mapper'
import { Attribute } from '../../mapper/type/attribute.type'
import { ModelConstructor } from '../../model/model-constructor'

export interface TypeInfo {
  type: ModelConstructor<any>
  genericType?: ModelConstructor<any>
}

export interface Key {
  type: DynamoDB.KeyType
}

export interface PropertyMetadata<T, R extends Attribute = Attribute> {
  // this property describes a key attribute (either partition or sort) for the table
  key?: Key

  // name of the property on js side
  name: keyof T

  // name of the dynamoDB attribute, same as key by default
  nameDb: string

  /*
   * the type will re resolved using compile time information leveraging the reflect api, due to some limitations we
   * cannot differ between Object, Set, Map and custom Classes so we need an additional @Type decorator
   */
  typeInfo?: TypeInfo

  /*
   * defines which dynamoDB type should be used for storing collection data, only L(ist) preserves order (compared to Set types)
   */
  isSortedCollection?: boolean

  mapper?: () => MapperForType<any, R>

  mapperForSingleItem?: () => MapperForType<any, any>

  // maps the index name to the key type to describe for which GSI this property describes a key attribute
  keyForGSI?: Record<string, DynamoDB.KeyType>

  // holds all the the index names for which this property describes the sort key attribute
  sortKeyForLSI?: string[]

  // index?: IModelAttributeIndex
  transient?: boolean

  defaultValueProvider?: () => any
}

/**
 * @hidden
 */
export function hasGenericType(
  propertyMetadata?: PropertyMetadata<any, any>,
): propertyMetadata is PropertyMetadata<any, any> & { typeInfo: { genericType: ModelConstructor<any> } } {
  return !!(propertyMetadata && propertyMetadata.typeInfo && propertyMetadata.typeInfo.genericType)
}

/**
 * @hidden
 */
export function hasType(
  propertyMetadata?: PropertyMetadata<any, any>,
): propertyMetadata is PropertyMetadata<any, any> & { typeInfo: { type: ModelConstructor<any> } } {
  return !!(propertyMetadata && propertyMetadata.typeInfo && propertyMetadata.typeInfo.type)
}

/**
 * @hidden
 */
export function alterCollectionPropertyMetadataForSingleItem<T>(
  propertyMeta?: PropertyMetadata<T> | null,
): PropertyMetadata<T> | undefined {
  if (!propertyMeta) {
    return
  }

  if (propertyMeta.mapper && propertyMeta.mapperForSingleItem) {
    return { ...propertyMeta, mapper: propertyMeta.mapperForSingleItem }
  }

  if (propertyMeta.typeInfo && (propertyMeta.typeInfo.type === Set || propertyMeta.typeInfo.type === Array)) {
    if (hasGenericType(propertyMeta)) {
      return <PropertyMetadata<T>>{ ...propertyMeta, typeInfo: { type: propertyMeta.typeInfo.genericType } }
    } else {
      return
    }
  }

  return { ...propertyMeta }
}
