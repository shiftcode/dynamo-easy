import { AttributeMap, AttributeValue } from 'aws-sdk/clients/dynamodb'
// import v1 from 'uuid'
import { Binary } from '../decorator/binary.type'
import { BlaType } from '../decorator/bla.type'
import { Metadata } from '../decorator/metadata'
import { MetadataHelper } from '../decorator/metadata-helper'
import { PropertyMetadata } from '../decorator/property-metadata.model'
import { ModelConstructor } from '../model/model-constructor'
import { AttributeModelType } from './attribute-model-type.type'
import { MapperForType } from './for-type/base.mapper'
import { BlaMapper } from './for-type/bla.mapper'
import { BooleanMapper } from './for-type/boolean.mapper'
import { CollectionMapper } from './for-type/collection.mapper'
import { DateMapper } from './for-type/date.mapper'
import { NullMapper } from './for-type/null.mapper'
import { NumberMapper } from './for-type/number.mapper'
import { ObjectMapper } from './for-type/object.mapper'
import { StringMapper } from './for-type/string.mapper'
import { NullType } from './null.type'
import { Util } from './util'
// import debug from 'debug';

/**
 * For the base convertion we use the DynamoDB converter.
 * We have some special requirements for which we add our own logic.
 */
export class Mapper {
  static mapperForType: Map<AttributeModelType, MapperForType<any>> = new Map()

  // static logger = debug('Mapper');

  static toDb<T>(item: T, modelConstructor?: ModelConstructor<T>): AttributeMap {
    const mapped: AttributeMap = <AttributeMap>{}

    if (modelConstructor) {
      const metadata: Metadata<T> = MetadataHelper.get(modelConstructor)

      /*
       * initialize possible properties with auto generated uuid
       */
      if (metadata) {
        metadata.getKeysWithUUID().forEach(propertyMetadata => {
          if (Reflect.get(<any>item, propertyMetadata.name)) {
            throw Error(
              `property where a UUID decorator is present can not have any other value ${JSON.stringify(
                propertyMetadata
              )}`
            )
          }

          Reflect.set(<any>item, propertyMetadata.name, Util.uuidv4())
        })
      }
    }

    const propertyNames: Array<keyof T> = (<Array<keyof T>>Object.getOwnPropertyNames(item)) || []
    propertyNames.forEach(propertyKey => {
      /*
       * 1) get the value of the property
       */
      const propertyDescriptor = Object.getOwnPropertyDescriptor(item, propertyKey)

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
      let attributeValue: AttributeValue | undefined

      let propertyMetadata: PropertyMetadata<any> | null | undefined
      if (modelConstructor) {
        propertyMetadata = MetadataHelper.forProperty(modelConstructor, propertyKey)
      }

      if (propertyMetadata) {
        if (propertyMetadata.transient) {
          // skip transient property
          // Mapper.logger.log('transient property -> skip')
        } else {
          /*
           * 3a) property metadata is defined
           */
          attributeValue = Mapper.toDbOne(propertyValue, propertyMetadata)
        }
      } else {
        /*
         * 3b) no metadata found
         */
        // let typeByConvention = Util.typeByConvention(propertyKey);
        // if (typeByConvention) {
        /*
           * 4a) matches a convention
           */
        // attributeValue = Mapper.mapperForConvention(typeByConvention).toDb(propertyValue);
        // } else {
        //   /*
        //    * 4b) no naming convention matches
        //    */
        attributeValue = Mapper.toDbOne(propertyValue)
        // }
      }

      if (attributeValue) {
        mapped[propertyMetadata ? propertyMetadata.nameDb : propertyKey] = attributeValue
      }
    })

    return mapped
  }

  static toDbOne(propertyValue: any, propertyMetadata?: PropertyMetadata<any>): AttributeValue {
    const explicitType: AttributeModelType | null =
      propertyMetadata && propertyMetadata.typeInfo && propertyMetadata.typeInfo.isCustom
        ? propertyMetadata.typeInfo.type!
        : null
    const type: AttributeModelType = explicitType || Util.typeOf(propertyValue)

    // some basic validation
    // TODO add check for binary type which is valid for parition key
    if (
      propertyMetadata &&
      propertyMetadata.key &&
      propertyMetadata.key.type === 'HASH' &&
      !propertyMetadata.mapper &&
      type !== String &&
      type !== Number &&
      type !== Binary
    ) {
      throw new Error(
        `make sure to define a custom mapper which returns a string or number value for partition key, type ${type} cannot be used as partition key, value = ${JSON.stringify(
          propertyValue
        )}`
      )
    }

    if (
      type === 'Moment' &&
      (!propertyMetadata || (propertyMetadata && propertyMetadata.typeInfo && !propertyMetadata.typeInfo.isCustom))
    ) {
      // TODO there is gonna be a problem when we have to map back from db and we have no property metadata, we could introduce some regex matching, do we want that?
    }

    if (propertyMetadata && propertyMetadata.mapper) {
      // custom mapper
      if (explicitType) {
        return new propertyMetadata.mapper().toDb(propertyValue, propertyMetadata)
      } else {
        return new propertyMetadata.mapper().toDb(propertyValue)
      }
    } else {
      // mapper by type
      if (explicitType) {
        return Mapper.forType(type).toDb(propertyValue, propertyMetadata)
      } else {
        return Mapper.forType(type).toDb(propertyValue)
      }
    }
  }

  static fromDb<T>(attributeMap: AttributeMap, modelClass?: ModelConstructor<T>): T {
    const model: T = <T>{}

    Object.getOwnPropertyNames(attributeMap).forEach(attributeName => {
      /*
       * 1) get the value of the property
       */
      const attributeValue: AttributeValue = attributeMap[attributeName]

      /*
       * 2) decide how to map the property depending on type or value
       */
      let modelValue: any
      let propertyMetadata: PropertyMetadata<any> | null | undefined
      if (modelClass) {
        propertyMetadata = MetadataHelper.forProperty(modelClass, attributeName)
      }

      if (propertyMetadata) {
        if (propertyMetadata.transient) {
          // skip transient property
          // Mapper.logger.log('transient property -> skip')
        } else {
          /*
           * 3a) property metadata is defined
           */
          modelValue = Mapper.fromDbOne(attributeValue, propertyMetadata)
        }
      } else {
        /*
         * 3b) no metadata found
         */
        // let typeByConvention = Util.typeByConvention(propertyKey);
        // if (typeByConvention) {
        //   /*
        //    * 4a) matches a convention
        //    */
        //   modelValue = Mapper.mapperForConvention(typeByConvention).fromDb(attributeValue);
        // } else {
        /*
           * 4b) no naming convention matches
           */
        modelValue = Mapper.fromDbOne(attributeValue)
        // }
      }

      Reflect.set(<any>model, propertyMetadata ? propertyMetadata.name : attributeName, modelValue)
      // throw new Error('don\'t know how to map without model class');
    })

    return model
  }

  static fromDbOne<T>(attributeValue: AttributeValue, propertyMetadata?: PropertyMetadata<any>): T {
    const explicitType: AttributeModelType | null =
      propertyMetadata && propertyMetadata.typeInfo && propertyMetadata.typeInfo.isCustom
        ? propertyMetadata.typeInfo.type!
        : null
    const type: AttributeModelType = explicitType || Util.typeOfFromDb(attributeValue)

    // Mapper.logger.log(`mapFromDbOne for type ${type}`)

    if (explicitType) {
      return Mapper.forType(type).fromDb(attributeValue, propertyMetadata)
    } else {
      return Mapper.forType(type).fromDb(attributeValue)
    }
  }

  static forType(type: AttributeModelType): MapperForType<any> {
    if (!Mapper.mapperForType.has(type)) {
      let mapperForType: MapperForType<any>
      switch (type) {
        case String:
          mapperForType = new StringMapper()
          break
        case Number:
          mapperForType = new NumberMapper()
          break
        case Boolean:
          mapperForType = new BooleanMapper()
          break
        case BlaType:
          mapperForType = new BlaMapper()
          break
        case Date:
          mapperForType = new DateMapper()
          break
        case Map:
          // Maps support complex types as keys, we only support String & Number as Keys, otherwise a .toString() method should be implemented,
          // so we now how to save a  key
          // mapperForType = new MapMapper()
          throw new Error('Map is not supported to be mapped for now')
        case Array:
          mapperForType = new CollectionMapper()
          break
        case Set:
          mapperForType = new CollectionMapper()
          break
        case Object:
          mapperForType = new ObjectMapper()
          break
        case NullType:
          mapperForType = new NullMapper()
          break
        case Binary:
          // TODO add binary mapper
          throw new Error('no mapper for binary type implemented yet')
        default:
          mapperForType = new ObjectMapper()
      }

      this.mapperForType.set(type, mapperForType)
    }

    return this.mapperForType.get(type)!
  }
}
