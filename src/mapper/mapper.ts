import { AttributeValue } from 'aws-sdk/clients/dynamodb'
// FIXME make this dependency optional
import moment from 'moment'
import * as UUID from 'uuid'
import { AttributeMap } from '../../attribute-map.type'
import { Metadata, MetadataHelper } from '../decorator/metadata'
import { PropertyMetadata } from '../decorator/property-metadata.model'
import { ModelConstructor } from '../model/model-constructor'
import { ScDynamoObjectMapper } from '../sc-dynamo-object-mapper'
import { AttributeModelType, NullType } from './attribute-model-type.type'
import { MapperForType } from './for-type/base.mapper'
import { BooleanMapper } from './for-type/boolean.mapper'
import { CollectionMapper } from './for-type/collection.mapper'
import { DateMapper } from './for-type/date.mapper'
import { MapMapper } from './for-type/map.mapper'
import { MomentMapper } from './for-type/moment.mapper'
import { NullMapper } from './for-type/null.mapper'
import { NumberMapper } from './for-type/number.mapper'
import { ObjectMapper } from './for-type/object.mapper'
import { StringMapper } from './for-type/string.mapper'
import { Util } from './util'
import { Binary } from '../decorator/binary.type'
import { Moment } from '../decorator/moment.type'
import { ObjectType } from 'aws-sdk/clients/clouddirectory'

export type PropertyMapperName = Boolean | String | Number | Object | Date | 'moment'

/**
 * For the base convertion we use the DynamoDB converter.
 * We have some special requirements for which we add our own logic.
 */
export class Mapper {
  static mapperForType: Map<PropertyMapperName, MapperForType<any>> = new Map()

  static toDb<T>(item: T, modelConstructor?: ModelConstructor<T>): AttributeMap<T> {
    let mapped: AttributeMap<T> = <AttributeMap<T>>{}

    if (modelConstructor) {
      let metadata: Metadata<T> = MetadataHelper.get(modelConstructor)

      /*
       * initialize possible properties with auto generated uuid
       */
      if (metadata) {
        metadata.getKeysWithUUID().forEach(propertyMetadata => {
          if (item[propertyMetadata.name]) {
            throw Error(`property where a UUID decorator is present can not have any other value ${JSON.stringify(propertyMetadata)}`)
          }

          item[propertyMetadata.name] = UUID.v1()
        })
      }
    }

    const propertyNames: (keyof T)[] = (<(keyof T)[]>Object.getOwnPropertyNames(item)) || []
    propertyNames.forEach(propertyKey => {
      /*
       * 1) get the value of the property
       */
      let propertyDescriptor = Object.getOwnPropertyDescriptor(item, propertyKey)

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

      let propertyMetadata: PropertyMetadata<any>
      if (modelConstructor) {
        propertyMetadata = MetadataHelper.forProperty(modelConstructor, propertyKey)
      }

      if (propertyMetadata) {
        if (propertyMetadata.transient) {
          // skip transient property
          // TODO replace with logger
          console.log('transient property -> skip')
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
      propertyMetadata && propertyMetadata.typeInfo && propertyMetadata.typeInfo.isCustom ? propertyMetadata.typeInfo.type : null
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
      throw new Error(`make sure to define a custom mapper which returns a string or number value for partition key, type ${type} cannot be used as partition key`)
    }

    if (type === 'Moment' && (!propertyMetadata || (propertyMetadata && propertyMetadata.typeInfo && !propertyMetadata.typeInfo.isCustom))) {
      // TODO there is gonna be a problem when we have to map back from db and we have no property metadata, we could introduce some regex matching, do we want that?
    }

    if (propertyMetadata && propertyMetadata.mapper) {
      // custom mapper
      return new propertyMetadata.mapper().toDb(propertyValue, explicitType ? propertyMetadata : null)
    } else {
      // mapper by type
      return Mapper.forType(type).toDb(propertyValue, explicitType ? propertyMetadata : null)
    }
  }

  static fromDb<T>(attributeMap: AttributeMap<T>, modelClass?: ModelConstructor<T>): T {
    let model: T = <T>{}

    let propertyNames: (keyof T)[] = <(keyof T)[]>Object.getOwnPropertyNames(attributeMap)
    propertyNames.forEach(propertyKey => {
      /*
       * 1) get the value of the property
       */
      let attributeValue: AttributeValue = attributeMap[propertyKey]

      /*
       * 2) decide how to map the property depending on type or value
       */
      let modelValue: any
      let propertyMetadata: PropertyMetadata<any>
      if (modelClass) {
        propertyMetadata = MetadataHelper.forProperty(modelClass, propertyKey)
      }

      if (propertyMetadata) {
        if (propertyMetadata.transient) {
          // skip transient property
          // TODO replace with logger
          console.log('transient property -> skip')
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

      model[propertyMetadata ? propertyMetadata.name : propertyKey] = modelValue
      // throw new Error('don\'t know how to map without model class');
    })

    return model
  }

  static fromDbOne<T>(attributeValue: AttributeValue, propertyMetadata?: PropertyMetadata<any>): T {
    const explicitType: AttributeModelType | null =
      propertyMetadata && propertyMetadata.typeInfo && propertyMetadata.typeInfo.isCustom ? propertyMetadata.typeInfo.type : null
    const type: AttributeModelType = explicitType || Util.typeOfFromDb(attributeValue)

    console.log(`mapFromDbOne for type ${type}`)
    return Mapper.forType(type).fromDb(attributeValue, explicitType ? propertyMetadata : null)
  }

  // static mapperForConvention<T>(typeFromConvention: 'date'): MapperForType<Date | moment.Moment> {
  //   switch (typeFromConvention) {
  //     case 'date':
  //       switch (ScDynamoObjectMapper.config.dateType) {
  //         case 'default':
  //           return this.forType(Date);
  //         case 'moment':
  //           return this.forType(Moment);
  //       }
  //       break;
  //     default:
  //       throw new Error(`there is no mapping defined for type ${typeFromConvention} which was resolved from property name convention`);
  //   }
  // }

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
        case Moment:
          mapperForType = new MomentMapper()
          break
        case Date:
          mapperForType = new DateMapper()
          break
        case Map:
          // Maps support complex types as keys, we only support String & Number as Keys, otherwise a .toString() method should be implemented,
          // so we now how to save a  key
          mapperForType = new MapMapper()
          break
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

    return this.mapperForType.get(type)
  }
}
