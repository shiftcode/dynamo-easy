import { AttributeValue } from "aws-sdk/clients/dynamodb"
// FIXME make this dependency optional
import moment from "moment"
import { AttributeMap } from "../../attribute-map.type"
import { MetadataHelper } from "../decorators/metadata"
import { PropertyMetadata } from "../decorators/property-metadata.model"
import { PropertyType } from "../decorators/property-type.type"
import { ModelClass } from "../model/model"
import { ScDynamoObjectMapper } from "../sc-dynamo-object-mapper"
import { AttributeModelTypeName } from "./attribute-model-type.type"
import { CollectionMapper } from "./for-type/collection.mapper"
import { MapperForType } from "./for-type/base.mapper"
import { BooleanMapper } from "./for-type/boolean.mapper"
import { DateMapper } from "./for-type/date.mapper"
import { MapMapper } from "./for-type/map.mapper"
import { MomentMapper } from "./for-type/moment.mapper"
import { NullMapper } from "./for-type/null.mapper"
import { NumberMapper } from "./for-type/number.mapper"
import { ObjectMapper } from "./for-type/object.mapper"
import { StringMapper } from "./for-type/string.mapper"
import { Util } from "./util"

/**
 * For the base convertion we use the DynamoDB converter.
 * We have some special requirements for which we add our own logic.
 */
export class Mapper {
  static REGEX_DATE_PROPERTY = /^(?:date|[\w]+Date(?:[A-Z]{1}[\w]+)?)$/

  static mapperForType: Map<PropertyType, MapperForType<any>> = new Map()

  static mapToDb<T>(item: T, modelClass?: ModelClass<T>): AttributeMap<T> {
    let mapped: AttributeMap<T> = <AttributeMap<T>>{}

    const propertyNames: (keyof T)[] =
      (<(keyof T)[]>Object.getOwnPropertyNames(item)) || []
    propertyNames.forEach(propertyKey => {
      /*
       * 1) get the value of the property
       */
      let propertyDescriptor = Object.getOwnPropertyDescriptor(
        item,
        propertyKey
      )

      // use get accessor if available otherwise use value property of descriptor
      let propertyValue: any
      if (propertyDescriptor.get) {
        propertyValue = propertyDescriptor.get()
      } else {
        propertyValue = propertyDescriptor.value
      }

      /*
       * 2) decide how to map the property depending on type or value
       */
      let attributeValue: AttributeValue

      let propertyMetadata: PropertyMetadata
      if (modelClass) {
        propertyMetadata = MetadataHelper.forProperty(modelClass, propertyKey)
      }

      if (propertyMetadata) {
        if (propertyMetadata.transient) {
          // skip transient property
          // TODO replace with logger
          console.log("transient property -> skip")
        } else {
          /*
           * 3a) property metadata is defined
           */
          attributeValue = Mapper.mapToDbOne(propertyValue, propertyMetadata)
        }
      } else {
        /*
         * 3b) no metadata found
         */
        if (Mapper.REGEX_DATE_PROPERTY.test(propertyKey)) {
          /*
           * 4a) matches a convention
           */
          attributeValue = Mapper.mapToDbFromConvention<T>(
            propertyKey,
            propertyValue,
            "date"
          )
        } else {
          /*
           * 4b) no naming convention matches
           */
          attributeValue = Mapper.mapToDbOne(propertyValue)
        }
      }

      if (attributeValue) {
        mapped[propertyKey] = attributeValue
      }
    })

    return mapped
  }

  static mapToDbOne(
    propertyValue: any,
    propertyMetadata?: PropertyMetadata
  ): AttributeValue {
    const explicitType: AttributeModelTypeName | null =
      propertyMetadata && propertyMetadata.customType
        ? propertyMetadata.typeName
        : null
    const type: AttributeModelTypeName =
      explicitType || Util.typeOf(propertyValue)

    console.log(`mapToDbOne for type ${type}`)
    return Mapper.forType(type).toDb(propertyValue)
  }

  static mapToDbFromConvention<T>(
    propertyName: keyof T,
    propertyValue: any,
    typeFromConvention: "date"
  ): AttributeValue {
    switch (typeFromConvention) {
      case "date":
        switch (ScDynamoObjectMapper.config.dateType) {
          case "default":
            return this.forType("Date").toDb(propertyValue)
          case "moment":
            return this.forType("Moment").toDb(propertyValue)
        }
        break
      default:
        throw new Error(
          `there is no mapping defined for type ${typeFromConvention} which was resolved from property name convention`
        )
    }
  }

  static mapFromDb<T>(
    attributeMap: AttributeMap<T>,
    modelClass?: ModelClass<T>
  ): T {
    let model: T = <T>{}

    let propertyNames: (keyof T)[] = <(keyof T)[]>Object.getOwnPropertyNames(
      attributeMap
    )
    propertyNames.forEach(propertyName => {
      let propertyValue: AttributeValue = attributeMap[propertyName]
      if (modelClass) {
        model[propertyName] = Mapper.mapFromDbOne(
          propertyValue,
          MetadataHelper.forProperty(modelClass, propertyName)
        )
      } else {
        model[propertyName] = Mapper.mapFromDbOne(propertyValue)
        // throw new Error('don\'t know how to map without model class');
      }
    })

    return model
  }

  static mapFromDbOne<T>(
    attributeValue: AttributeValue,
    propertyMetadata?: PropertyMetadata
  ): T {
    const explicitType: AttributeModelTypeName | null =
      propertyMetadata && propertyMetadata.customType
        ? propertyMetadata.typeName
        : null
    const type: AttributeModelTypeName =
      explicitType || Util.typeOfFromDb(attributeValue)

    console.log(`mapFromDbOne for type ${type}`)
    return Mapper.forType(type).fromDb(attributeValue)
  }

  private static forType(type: AttributeModelTypeName): MapperForType<any> {
    if (!Mapper.mapperForType.has(type)) {
      let mapperForType: MapperForType<any>
      switch (type) {
        case "String":
          mapperForType = new StringMapper()
          break
        case "Number":
          mapperForType = new NumberMapper()
          break
        case "Boolean":
          mapperForType = new BooleanMapper()
          break
        case "Moment":
          mapperForType = new MomentMapper()
          break
        case "Date":
          mapperForType = new DateMapper()
          break
        case "Map":
          // Maps support complex types as keys, we only support String & Number as Keys, otherwise a .toString() method should be implemented, so we now how to save a  key
          mapperForType = new MapMapper()
          break
        case "Array":
          mapperForType = new CollectionMapper()
          break
        case "Set":
          mapperForType = new CollectionMapper()
          break
        case "Object":
          mapperForType = new ObjectMapper()
          break
        case "Null":
          mapperForType = new NullMapper()
          break
        case "Binary":
        default:
          mapperForType = new ObjectMapper()
        // throw new Error(`no mapper defined for type ${type}`);
      }
      this.mapperForType.set(type, mapperForType)
    }

    return this.mapperForType.get(type)
  }
}
