import { AttributeValue } from "aws-sdk/clients/dynamodb"
import { AttributeCollectionType } from "../attribute-type.type"
import { Mapper } from "../mapper"
import { Util } from "../util"
import { MapperForType } from "./base.mapper"

export class CollectionMapper implements MapperForType<any[] | Set<any>> {
  fromDb(attributeValue: AttributeValue): any[] | Set<any> {
    if (attributeValue.SS) {
      return new Set(attributeValue.SS)
    }

    if (attributeValue.NS) {
      return new Set(attributeValue.NS.map(item => parseFloat(item)))
    }

    if (attributeValue.BS) {
      return new Set(attributeValue.BS)
    }

    // TODO what should be the default if no property options are available?
    if (attributeValue.L) {
      return attributeValue.L.map(item => Mapper.mapFromDbOne(item))
    }
  }

  toDb(propertyValue: any[] | Set<any>): AttributeValue {
    if (Array.isArray(propertyValue) || Util.isSet(propertyValue)) {
      const attributeValue: AttributeValue = {}
      const collectionType: AttributeCollectionType = Util.detectCollectionType(
        propertyValue
      )

      // convert to array if we deal with a set
      if (Util.isSet(propertyValue)) {
        propertyValue = Array.from(propertyValue)
      }

      let propertyValue2
      switch (collectionType) {
        case "SS":
          propertyValue2 = propertyValue
          break
        case "NS":
          propertyValue2 = (<number[]>propertyValue).map(num => num.toString())
          break
        case "BS":
          propertyValue2 = propertyValue
          break
        case "L":
          propertyValue2 = (<any[]>propertyValue).map(value =>
            Mapper.mapToDbOne(value)
          )
          break
      }
      attributeValue[collectionType] = propertyValue2
      return attributeValue
    } else {
      throw new Error(`given value is not an array ${propertyValue}`)
    }
  }
}
