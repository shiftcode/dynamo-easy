import { KeyType } from 'aws-sdk/clients/dynamodb'
import moment from 'moment'
import { MapperForType } from '../mapper/for-type/base.mapper'
import { ModelConstructor } from '../model/model-constructor'

export interface TypeInfo<T> {
  type: ModelConstructor<T>
  // typeName: AttributeModelTypeName;
  // TODO define what custom means
  // true if we use a non native type for dynamo document client
  isCustom?: boolean
  // FIXME should we support only one generic type for now?
  genericTypes?: ModelConstructor<any>[]
  // genericNames?: AttributeModelTypeName[];
}

export interface Key {
  type: KeyType
  uuid?: boolean
}

export interface PropertyMetadata<T> {
  // this property desribes a key attribute (either partition or sort) for the table
  key?: Key

  // name of the property on js side
  name: string

  // name of the dynamodb attribute, same as key by default
  nameDb?: string

  /*
   * the type will re resolved using compile time information leveraging the reflect api, due to some limitations we
   * cannot differ between Object, Set, Map so we need an additional @Type decorator
   */
  typeInfo?: Partial<TypeInfo<T>>

  /*
   * defines which dynamodb type should be used for storing collection data, only L(ist) preserves order (compared to Set types)
   */
  isSortedCollection?: boolean

  mapper?: ModelConstructor<MapperForType<any>>

  // maps the index name to the key type to describe for which GSI this property describes a key attribute
  keyForGSI?: { [key: string]: KeyType }

  // holds all the the index names for which this property describes the sort key attribute
  sortKeyForLSI?: string[]

  // index?: IModelAttributeIndex
  transient?: boolean
}

export function hasGenericType(propertyMetadata: PropertyMetadata<any>): boolean {
  return !!(propertyMetadata && propertyMetadata.typeInfo && propertyMetadata.typeInfo.genericTypes && propertyMetadata.typeInfo.genericTypes.length)
}
