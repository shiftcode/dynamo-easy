import { hasGenericType, PropertyMetadata } from '../../decorator'
import { notNull } from '../../helper'
import { fromDb, fromDbOne, toDb, toDbOne } from '../mapper'
import { AttributeCollectionType, AttributeType } from '../type/attribute-type.type'
import {
  BinarySetAttribute,
  ListAttribute,
  MapAttribute,
  NullAttribute,
  NumberSetAttribute,
  StringSetAttribute,
} from '../type/attribute.type'
import { detectCollectionTypeFromValue, isBufferType, isSet } from '../util'
import { MapperForType } from './base.mapper'

type CollectionAttributeTypes =
  | StringSetAttribute
  | NumberSetAttribute
  | BinarySetAttribute
  | ListAttribute
  | NullAttribute

function collectionFromDb(
  attributeValue: CollectionAttributeTypes,
  propertyMetadata?: PropertyMetadata<any, CollectionAttributeTypes>,
): any[] | Set<any> {
  const explicitType = propertyMetadata && propertyMetadata.typeInfo ? propertyMetadata.typeInfo.type : null

  if ('SS' in attributeValue) {
    const arr: string[] = attributeValue.SS
    return explicitType && explicitType === Array ? arr : new Set(arr)
  }

  if ('NS' in attributeValue) {
    const arr: number[] = attributeValue.NS.map(parseFloat)
    return explicitType && explicitType === Array ? arr : new Set(arr)
  }

  if ('BS' in attributeValue) {
    const arr: any[] = attributeValue.BS
    return explicitType && explicitType === Array ? arr : new Set(arr)
  }

  if ('L' in attributeValue) {
    let arr: any[]
    if (hasGenericType(propertyMetadata)) {
      arr = attributeValue.L.map(item => fromDb((<MapAttribute>item).M, propertyMetadata.typeInfo.genericType))
    } else {
      // tslint:disable-next-line:no-unnecessary-callback-wrapper
      arr = attributeValue.L.map(v => fromDbOne(v))
    }
    return explicitType && explicitType === Set ? new Set(arr) : arr
  }

  throw new Error('No Collection Data (SS | NS | BS | L) was found in attribute data')
}

function collectionToDb(
  propertyValue: any[] | Set<any>,
  propertyMetadata?: PropertyMetadata<any, CollectionAttributeTypes>,
): CollectionAttributeTypes | null {
  if (Array.isArray(propertyValue) || isSet(propertyValue)) {
    let collectionType: AttributeType
    // detect collection type
    if (propertyMetadata) {
      // based on metadata
      collectionType = detectCollectionTypeFromMetadata(propertyMetadata, propertyValue)
    } else {
      // based on value
      collectionType = detectCollectionTypeFromValue(propertyValue)
    }

    // convert to array if we deal with a set for same behaviour
    propertyValue = isSet(propertyValue) ? Array.from(propertyValue) : propertyValue

    // empty values are not allowed for S(et) types only for L(ist)
    if ((collectionType === 'SS' || collectionType === 'NS' || collectionType === 'BS') && propertyValue.length === 0) {
      return null
    }

    // do the mapping depending on type
    switch (collectionType) {
      case 'SS':
        return { SS: propertyValue }
      case 'NS':
        return { NS: propertyValue.map(num => num.toString()) }
      case 'BS':
        return { BS: propertyValue }
      case 'L':
        if (hasGenericType(propertyMetadata)) {
          return {
            L: propertyValue.map(value => ({
              M: toDb(value, propertyMetadata.typeInfo.genericType),
            })),
          }
        } else {
          return {
            L: propertyValue
            // tslint:disable-next-line:no-unnecessary-callback-wrapper
              .map(v => toDbOne(v))
              .filter(notNull),
          }
        }
      default:
        throw new Error(`Collection type must be one of SS | NS | BS | L found type ${collectionType}`)
    }
  } else {
    throw new Error(`Given value must be either Array or Set ${propertyValue}`)
  }
}

export const CollectionMapper: MapperForType<any[] | Set<any>, CollectionAttributeTypes> = {
  fromDb: collectionFromDb,
  toDb: collectionToDb,
}


function detectCollectionTypeFromMetadata(propertyMetadata: PropertyMetadata<any, CollectionAttributeTypes>, propertyValue: any): AttributeCollectionType {
  let collectionType: AttributeType
  const explicitType = propertyMetadata && propertyMetadata.typeInfo ? propertyMetadata.typeInfo.type : null
  switch (explicitType) {
    case Array:
      collectionType = 'L'
      break
    case Set:
      if (propertyMetadata.isSortedCollection) {
        // only the L(ist) type preserves order
        collectionType = 'L'
      } else {
        if (hasGenericType(propertyMetadata)) {
          // generic type of Set is defined, so decide based on the generic type which db set type should be used
          if (isBufferType(propertyMetadata.typeInfo.genericType)) {
            collectionType = 'BS'
          } else {
            switch (propertyMetadata.typeInfo.genericType) {
              case String:
                collectionType = 'SS'
                break
              case Number:
                collectionType = 'NS'
                break
              default:
                // fallback to list if the type is not one of String or Number
                collectionType = 'L'
            }
          }
        } else {
          // auto detect based on set item values
          collectionType = detectCollectionTypeFromValue(propertyValue)
        }
      }
      break
    default:
      throw new Error(`only 'Array' and 'Set' are valid values for explicit type, found ${explicitType}`)
  }

  return collectionType
}
