import { Metadata } from '../decorator/metadata/metadata'
import { MetadataHelper } from '../decorator/metadata/metadata-helper'
import { PropertyMetadata } from '../decorator/metadata/property-metadata.model'
import { ModelConstructor } from '../model/model-constructor'
import { MapperForType } from './for-type/base.mapper'
import { BooleanMapper } from './for-type/boolean.mapper'
import { CollectionMapper } from './for-type/collection.mapper'
import { DateMapper } from './for-type/date.mapper'
import { EnumMapper } from './for-type/enum.mapper'
import { MomentMapper } from './for-type/moment.mapper'
import { NullMapper } from './for-type/null.mapper'
import { NumberMapper } from './for-type/number.mapper'
import { ObjectMapper } from './for-type/object.mapper'
import { StringMapper } from './for-type/string.mapper'
import { AttributeValueType } from './type/attribute-value-type.type'
import { Attribute, Attributes } from './type/attribute.type'
import { Binary } from './type/binary.type'
import { EnumType } from './type/enum.type'
import { MomentType } from './type/moment.type'
import { NullType } from './type/null.type'
import { UndefinedType } from './type/undefined.type'
import { Util } from './util'

// import debug from 'debug';

/**
 *
 */
export class Mapper {
  static mapperForType: Map<AttributeValueType, MapperForType<any, any>> = new Map()

  // static logger = debug('Mapper');

  static toDb<T>(item: T, modelConstructor?: ModelConstructor<T>): Attributes<T> {
    const mapped = <Attributes<T>>{}

    if (modelConstructor) {
      const metadata: Metadata<T> = MetadataHelper.get(modelConstructor)

      /*
       * initialize possible properties with auto generated uuid
       */
      if (metadata) {
        metadata.getKeysWithUUID().forEach(propertyMetadata => {
          if (!Reflect.get(<any>item, propertyMetadata.name)) {
            Reflect.set(<any>item, propertyMetadata.name, Util.uuidv4())
          }
        })
      }
    }

    const propertyNames: Array<keyof T> = <Array<keyof T>>Object.getOwnPropertyNames(item) || []
    propertyNames.forEach(propertyKey => {
      /*
       * 1) get the value of the property
       */
      const propertyValue = Mapper.getPropertyValue(item, propertyKey)

      let attributeValue: any | undefined | null

      // TODO concept maybe make this configurable how to map undefined & null values
      if (propertyValue === undefined || propertyValue === null) {
        // noop ignore because we can't map it
      } else {
        /*
         * 2) decide how to map the property depending on type or value
         */

        let propertyMetadata: PropertyMetadata<T, any> | null | undefined
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

        if (attributeValue === undefined) {
          // no-op transient field, just ignore it
        } else if (attributeValue === null) {
          // empty values (string, set, list) will be ignored too
        } else {
          mapped[propertyMetadata ? propertyMetadata.nameDb : <string>propertyKey] = attributeValue
        }
      }
    })

    return mapped
  }

  static toDbOne(propertyValue: any, propertyMetadata?: PropertyMetadata<any>): Attribute | null {
    const explicitType: AttributeValueType | null =
      propertyMetadata && propertyMetadata.typeInfo && propertyMetadata.typeInfo.isCustom
        ? propertyMetadata.typeInfo.type!
        : null
    const type: AttributeValueType = explicitType || Util.typeOf(propertyValue)

    const mapper = propertyMetadata && propertyMetadata.mapper ? new propertyMetadata.mapper() : Mapper.forType(type)

    const attrValue: Attribute | null = explicitType
      ? mapper.toDb(propertyValue, propertyMetadata)
      : mapper.toDb(propertyValue)

    // some basic validation
    if (propertyMetadata && propertyMetadata.key) {
      if (attrValue === null) {
        throw new Error(`${propertyMetadata.name.toString()} is null but is a ${propertyMetadata.key.type} key`)
      }
      if (!('S' in attrValue) && !('N' in attrValue) && !('B' in attrValue)) {
        throw new Error(
          `\
DynamoDb only allows string, number or binary type for RANGE and HASH key. \
Make sure to define a custom mapper for '${propertyMetadata.name.toString()}' which returns a string, number or binary value for partition key, \
type ${type} cannot be used as partition key, value = ${JSON.stringify(propertyValue)}`
        )
      }
    }
    return attrValue
  }

  /**
   * returns the function for the given ModelConstructor to create the AttributeMap with HASH (and RANGE) Key of a given item. used to delete items
   * @param modelConstructor
   */
  static createToKeyFn<T>(modelConstructor: ModelConstructor<T>): (item: T) => Attributes {
    const metadata = MetadataHelper.get(modelConstructor)
    const properties = metadata.modelOptions.properties
    if (!properties) {
      throw new Error('metadata properties is not defined')
    }
    const keyProps = properties.filter(p => !!p.key)

    return (item: T) =>
      keyProps.reduce(
        (key, propMeta) => {
          const propertyValue = Mapper.getPropertyValue(item, propMeta.name)
          if (propertyValue === null || propertyValue === undefined) {
            throw new Error(`there is no value for property ${propMeta.name} but is the ${propMeta.key!.type} key`)
          }
          const attributeValue = Mapper.toDbOne(propertyValue, propMeta)!
          return { ...key, [<string>propMeta.name]: attributeValue }
        },
        <Attributes>{}
      )
  }

  static toKey<T>(item: T, modelConstructor: ModelConstructor<T>): Attributes {
    return Mapper.createToKeyFn(modelConstructor)(item)
  }

  static fromDb<T>(attributeMap: Attributes, modelClass?: ModelConstructor<T>): T {
    const model: T = <T>{}

    Object.getOwnPropertyNames(attributeMap).forEach(attributeName => {
      /*
       * 1) get the value of the property
       */
      const attributeValue = attributeMap[attributeName]

      /*
       * 2) decide how to map the property depending on type or value
       */
      let modelValue: any
      let propertyMetadata: PropertyMetadata<any, any> | null | undefined
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
          if (propertyMetadata && propertyMetadata.mapper) {
            // custom mapper
            modelValue = new propertyMetadata.mapper().fromDb(attributeValue, propertyMetadata)
          } else {
            modelValue = Mapper.fromDbOne(attributeValue, propertyMetadata)
          }
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

  static fromDbOne<T>(attributeValue: Attribute, propertyMetadata?: PropertyMetadata<any, any>): T {
    const explicitType: AttributeValueType | null =
      propertyMetadata && propertyMetadata.typeInfo && propertyMetadata.typeInfo.isCustom
        ? propertyMetadata.typeInfo.type!
        : null
    const type: AttributeValueType = explicitType || Util.typeOfFromDb(attributeValue)

    // Mapper.logger.log(`mapFromDbOne for type ${type}`)

    if (explicitType) {
      return Mapper.forType(type).fromDb(attributeValue, propertyMetadata)
    } else {
      return Mapper.forType(type).fromDb(attributeValue)
    }
  }

  static forType(type: AttributeValueType): MapperForType<any, Attribute> {
    // FIXME HIGH review this, we now use toString to compare because we had issues with ng client for moment when
    // using a GSI on creationDate (MomentType) was a different MomentType than for lastUpdatedDate
    if (!Mapper.mapperForType.has(type.toString())) {
      let mapperForType: MapperForType<any, Attribute>
      switch (type.toString()) {
        case String.toString():
          mapperForType = new StringMapper()
          break
        case Number.toString():
          mapperForType = new NumberMapper()
          break
        case Boolean.toString():
          mapperForType = new BooleanMapper()
          break
        case MomentType.toString():
          mapperForType = new MomentMapper()
          break
        case Date.toString():
          mapperForType = new DateMapper()
          break
        case EnumType.toString():
          mapperForType = new EnumMapper()
          break
        case Map.toString():
          // Maps support complex types as keys, we only support String & Number as Keys, otherwise a .toString() method should be implemented,
          // so we now how to save a  key
          // mapperForType = new MapMapper()
          throw new Error('Map is not supported to be mapped for now')
        case Array.toString():
          mapperForType = new CollectionMapper()
          break
        case Set.toString():
          mapperForType = new CollectionMapper()
          break
        case Object.toString():
          mapperForType = new ObjectMapper()
          break
        case NullType.toString():
          mapperForType = new NullMapper()
          break
        case Binary.toString():
          // TODO LOW:BINARY add binary mapper
          throw new Error('no mapper for binary type implemented yet')
        case UndefinedType.toString():
          mapperForType = new ObjectMapper()
          break
        default:
          throw new Error('no mapper defined for type ' + JSON.stringify(type))
        // mapperForType = new ObjectMapper()
      }

      this.mapperForType.set(type.toString(), mapperForType)
    }

    return this.mapperForType.get(type.toString())!
  }

  static getPropertyValue(item: any, propertyKey: PropertyKey): any {
    const propertyDescriptor = Object.getOwnPropertyDescriptor(item, propertyKey)

    // use get accessor if available otherwise use value property of descriptor
    if (propertyDescriptor) {
      if (propertyDescriptor.get) {
        return propertyDescriptor.get()
      } else {
        return propertyDescriptor.value
      }
    } else {
      throw new Error(
        `there is no property descriptor for item ${JSON.stringify(item)} and property key ${<string>propertyKey}`
      )
    }
  }
}
