import { AttributeMap, AttributeValue } from 'aws-sdk/clients/dynamodb'
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
import { AttributeModelType } from './type/attribute-model.type'
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
      const propertyDescriptor = Object.getOwnPropertyDescriptor(item, propertyKey)

      // use get accessor if available otherwise use value property of descriptor
      let propertyValue: any
      if (propertyDescriptor) {
        if (propertyDescriptor.get) {
          propertyValue = propertyDescriptor.get()
        } else {
          propertyValue = propertyDescriptor.value
        }
      } else {
        throw new Error(
          'there is no property descriptor for item ' + JSON.stringify(item) + ' and property key ' + propertyKey
        )
      }

      let attributeValue: AttributeValue | undefined | null

      // TODO concept maybe make this configurable how to map undefined & null values
      if (propertyValue === undefined || propertyValue === null) {
        // noop ignore because we can't map it
      } else {
        /*
         * 2) decide how to map the property depending on type or value
         */

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

  static toDbOne(propertyValue: any, propertyMetadata?: PropertyMetadata<any>): AttributeValue | null {
    const explicitType: AttributeModelType | null =
      propertyMetadata && propertyMetadata.typeInfo && propertyMetadata.typeInfo.isCustom
        ? propertyMetadata.typeInfo.type!
        : null
    const type: AttributeModelType = explicitType || Util.typeOf(propertyValue)

    // some basic validation
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
    // FIXME HIGH review this, we now use toString to compare because we had issues with ng client for moment when
    // using a GSI on creationDate (MomentType) was a different MomentType than for lastUpdatedDate
    if (!Mapper.mapperForType.has(type.toString())) {
      let mapperForType: MapperForType<any>
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
}
