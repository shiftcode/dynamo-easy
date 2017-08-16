import { AttributeValue } from "aws-sdk/clients/dynamodb"
import {
  hasGenericType,
  PropertyMetadata,
} from "../../decorator/property-metadata.model"
import { AttributeCollectionType } from "../attribute-type.type"
import { Mapper } from "../mapper"
import { Util } from "../util"
import { MapperForType } from "./base.mapper"

export class CollectionMapper implements MapperForType<any[] | Set<any>> {
  // TODO add some validation rules based on propertyMetadata and returned value from db for sorted as example (SS -> sorted -> throw error)
  fromDb(
    attributeValue: AttributeValue,
    propertyMetadata?: PropertyMetadata<any>
  ): any[] | Set<any> {
    const explicitType = propertyMetadata
      ? propertyMetadata.typeInfo.type
      : null
    if (attributeValue.SS) {
      const arr: string[] = attributeValue.SS
      return explicitType && explicitType === Array ? arr : new Set(arr)
    }

    if (attributeValue.NS) {
      const arr: number[] = attributeValue.NS.map(item => parseFloat(item))
      return explicitType && explicitType === Array ? arr : new Set(arr)
    }

    if (attributeValue.BS) {
      const arr: any[] = attributeValue.BS
      return explicitType && explicitType === Array ? arr : new Set(arr)
    }

    if (attributeValue.L) {
      let arr: any[]
      if (
        propertyMetadata &&
        propertyMetadata.typeInfo &&
        propertyMetadata.typeInfo.genericTypes &&
        propertyMetadata.typeInfo.genericTypes.length
      ) {
        arr = attributeValue.L.map(item =>
          Mapper.fromDb(item.M, propertyMetadata.typeInfo.genericTypes[0])
        )
      } else {
        arr = attributeValue.L.map(value => Mapper.fromDbOne(value))
      }

      return explicitType && explicitType === Set ? new Set(arr) : arr
    }
  }

  toDb(
    propertyValue: any[] | Set<any>,
    propertyMetadata?: PropertyMetadata<any>
  ): AttributeValue {
    if (Array.isArray(propertyValue) || Util.isSet(propertyValue)) {
      const attributeValue: AttributeValue = {}

      let collectionType: AttributeCollectionType
      if (propertyMetadata) {
        const explicitType = propertyMetadata.typeInfo.type
        switch (explicitType) {
          case Array:
            collectionType = "L"
            break
          case Set:
            if (propertyMetadata.isSortedCollection) {
              // only the L(ist) type preserves order
              collectionType = "L"
            } else {
              // auto detect based on set item values
              collectionType = Util.detectCollectionType(propertyValue)
            }
            break
          default:
            throw new Error(
              `only 'Array' and 'Set' are valid values for explicit type, found ${explicitType}`
            )
        }
      } else {
        // auto detect based on set item values
        collectionType = Util.detectCollectionType(propertyValue)
      }

      // convert to array if we deal with a set
      if (Util.isSet(propertyValue)) {
        propertyValue = Array.from(propertyValue)
      }

      let propertyValueMapped
      switch (collectionType) {
        case "SS":
          propertyValueMapped = propertyValue
          break
        case "NS":
          propertyValueMapped = (<number[]>propertyValue).map(num =>
            num.toString()
          )
          break
        case "BS":
          propertyValueMapped = propertyValue
          break
        case "L":
          if (hasGenericType(propertyMetadata)) {
            propertyValueMapped = (<any[]>propertyValue).map(value => ({
              M: Mapper.toDb(value, propertyMetadata.typeInfo.genericTypes[0]),
            }))
          } else {
            propertyValueMapped = (<any[]>propertyValue).map(value =>
              Mapper.toDbOne(value)
            )
          }
          break
      }
      attributeValue[collectionType] = propertyValueMapped
      return attributeValue
    } else {
      throw new Error(`given value is not an array ${propertyValue}`)
    }
  }
}
