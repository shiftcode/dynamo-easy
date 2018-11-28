import { hasGenericType, PropertyMetadata } from '../../decorator'
import { notNull } from '../../helper'
import { Mapper } from '../mapper'
import { AttributeType } from '../type/attribute-type.type'
import {
  BinarySetAttribute,
  ListAttribute,
  MapAttribute,
  NullAttribute,
  NumberSetAttribute,
  StringSetAttribute,
} from '../type/attribute.type'
import { Util } from '../util'
import { MapperForType } from './base.mapper'

type CollectionAttributeTypes =
  | StringSetAttribute
  | NumberSetAttribute
  | BinarySetAttribute
  | ListAttribute
  | NullAttribute

export class CollectionMapper implements MapperForType<any[] | Set<any>, CollectionAttributeTypes> {
  fromDb(
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
        arr = attributeValue.L.map(item =>
          Mapper.fromDb((<MapAttribute>item).M, propertyMetadata!.typeInfo!.genericType),
        )
      } else {
        arr = attributeValue.L.map(value => Mapper.fromDbOne(value))
      }
      return explicitType && explicitType === Set ? new Set(arr) : arr
    }

    throw new Error('No Collection Data (SS | NS | BS | L) was found in attribute data')
  }

  toDb(
    propertyValue: any[] | Set<any>,
    propertyMetadata?: PropertyMetadata<any, CollectionAttributeTypes>,
  ): CollectionAttributeTypes | null {
    if (Array.isArray(propertyValue) || Util.isSet(propertyValue)) {
      let collectionType: AttributeType
      if (propertyMetadata) {
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
              if ((<Set<any>>propertyValue).size === 0) {
                // if the type is Set defined by propertyMetadata and the value is empty return null type, empty set is not allowed
                return { NULL: true }
              } else {
                if (hasGenericType(propertyMetadata)) {
                  // generic type of Set is defined, so decide based on the generic type which db set type should be used
                  if (Util.isBufferType(propertyMetadata.typeInfo!.genericType)) {
                    collectionType = 'BS'
                  } else {
                    switch (propertyMetadata.typeInfo!.genericType) {
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
                  collectionType = Util.detectCollectionType(propertyValue)
                }
              }
            }
            break
          default:
            throw new Error(`only 'Array' and 'Set' are valid values for explicit type, found ${explicitType}`)
        }
      } else {
        // auto detect based on set item values
        collectionType = Util.detectCollectionType(propertyValue)
      }

      // convert to array if we deal with a set
      if (Util.isSet(propertyValue)) {
        propertyValue = Array.from(propertyValue)
      }

      // empty value is not allowed for S(et) (supported for L(ist))
      if (propertyValue.length === 0) {
        return null
      } else {
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
                  M: Mapper.toDb(value, propertyMetadata!.typeInfo!.genericType),
                })),
              }
            } else {
              return {
                L: propertyValue.map(value => Mapper.toDbOne(value)).filter(notNull),
              }
            }
          default:
            throw new Error(`Collection type must be one of SS | NS | BS | L found type ${collectionType}`)
        }
      }
    } else {
      throw new Error(`given value is not an array ${propertyValue}`)
    }
  }
}
