import { Metadata } from '../decorator/metadata/metadata'
import { metadataForClass, metadataForProperty } from '../decorator/metadata/metadata-helper'
import { Key, PropertyMetadata } from '../decorator/metadata/property-metadata.model'
import { ModelConstructor } from '../model'
import { MapperForType } from './for-type/base.mapper'
import { BooleanMapper } from './for-type/boolean.mapper'
import { CollectionMapper } from './for-type/collection.mapper'
import { EnumMapper } from './for-type/enum.mapper'
import { NullMapper } from './for-type/null.mapper'
import { NumberMapper } from './for-type/number.mapper'
import { ObjectMapper } from './for-type/object.mapper'
import { StringMapper } from './for-type/string.mapper'
import { AttributeValueType } from './type/attribute-value-type.type'
import { Attribute, Attributes } from './type/attribute.type'
import { Binary } from './type/binary.type'
import { EnumType } from './type/enum.type'
import { NullType } from './type/null.type'
import { UndefinedType } from './type/undefined.type'
import { typeOf, typeOfFromDb, uuidv4 } from './util'

const mapperForType: Map<AttributeValueType, MapperForType<any, any>> = new Map()

export function toDb<T>(item: T, modelConstructor?: ModelConstructor<T>): Attributes<T> {
  const mapped = <Attributes<T>>{}

  if (modelConstructor) {
    const metadata: Metadata<T> = metadataForClass(modelConstructor)

    /*
     * initialize possible properties with auto generated uuid
     */
    if (metadata) {
      metadata.getKeysWithUUID().forEach(propertyMetadata => {
        if (!Reflect.get(<any>item, propertyMetadata.name)) {
          Reflect.set(<any>item, propertyMetadata.name, uuidv4())
        }
      })
    }
  }

  const propertyNames: Array<keyof T> = <Array<keyof T>>Object.getOwnPropertyNames(item) || []
  propertyNames.forEach(propertyKey => {
    /*
     * 1) get the value of the property
     */
    const propertyValue = getPropertyValue(item, propertyKey)

    let attributeValue: Attribute | undefined | null

    // TODO concept maybe make this configurable how to map undefined & null values
    if (propertyValue === undefined || propertyValue === null) {
      // noop ignore because we can't map it
    } else {
      /*
       * 2) decide how to map the property depending on type or value
       */

      let propertyMetadata: PropertyMetadata<T, any> | null | undefined
      if (modelConstructor) {
        propertyMetadata = metadataForProperty(modelConstructor, propertyKey)
      }

      if (propertyMetadata) {
        if (propertyMetadata.transient) {
          // skip transient property
          // logger.log('transient property -> skip')
        } else {
          /*
           * 3a) property metadata is defined
           */
          attributeValue = toDbOne(propertyValue, propertyMetadata)
        }
      } else {
        /*
         * 3b) no metadata found
         */
        // let typeByConvention = typeByConvention(propertyKey);
        // if (typeByConvention) {
        /*
         * 4a) matches a convention
         */
        // attributeValue = mapperForConvention(typeByConvention).toDb(propertyValue);
        // } else {
        //   /*
        //    * 4b) no naming convention matches
        //    */

        attributeValue = toDbOne(propertyValue)
        // }
      }

      if (attributeValue === undefined) {
        // no-op transient field, just ignore it
      } else if (attributeValue === null) {
        // empty values (string, set, list) will be ignored too
      } else {
        ;(<any>mapped)[propertyMetadata ? propertyMetadata.nameDb : propertyKey] = attributeValue
      }
    }
  })

  return mapped
}

export function toDbOne(propertyValue: any, propertyMetadata?: PropertyMetadata<any>): Attribute | null {
  const explicitType: AttributeValueType | null =
    propertyMetadata && propertyMetadata.typeInfo && propertyMetadata.typeInfo.isCustom
      ? propertyMetadata.typeInfo.type
      : null
  const type: AttributeValueType = explicitType || typeOf(propertyValue)

  const mapper = propertyMetadata && propertyMetadata.mapper ? propertyMetadata.mapper() : forType(type)

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
type ${type} cannot be used as partition key, value = ${JSON.stringify(propertyValue)}`,
      )
    }
  }
  return attrValue
}

function testForKey<T>(p: PropertyMetadata<T>): p is PropertyMetadata<T> & { key: Key } {
  return !!p.key
}

/**
 * returns the function for the given ModelConstructor to create the AttributeMap with HASH (and RANGE) Key of a given item. used to delete items
 * @param modelConstructor
 */
export function createToKeyFn<T>(modelConstructor: ModelConstructor<T>): (item: T) => Attributes<T> {
  const metadata = metadataForClass(modelConstructor)
  const properties = metadata.modelOptions.properties
  if (!properties) {
    throw new Error('metadata properties is not defined')
  }

  const keyProperties = properties.filter(testForKey)

  return (item: T) =>
    keyProperties.reduce(
      (key, propMeta) => {
        const propertyValue = getPropertyValue(item, propMeta.name)

        if (propertyValue === null || propertyValue === undefined) {
          throw new Error(`there is no value for property ${propMeta.name.toString()} but is ${propMeta.key.type} key`)
        }

        // fixme: typings
        ;(<any>key)[propMeta.name] = <Attribute>toDbOne(propertyValue, propMeta)
        return key
      },
      <Attributes<T>>{},
    )
}

export function toKey<T>(item: T, modelConstructor: ModelConstructor<T>): Attributes {
  return createToKeyFn(modelConstructor)(item)
}

export function fromDb<T>(attributeMap: Attributes, modelClass?: ModelConstructor<T>): T {
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
      propertyMetadata = metadataForProperty(modelClass, attributeName)
    }

    if (propertyMetadata) {
      if (propertyMetadata.transient) {
        // skip transient property
      } else {
        /*
         * 3a) property metadata is defined
         */
        if (propertyMetadata && propertyMetadata.mapper) {
          // custom mapper
          modelValue = propertyMetadata.mapper().fromDb(attributeValue, propertyMetadata)
        } else {
          modelValue = fromDbOne(attributeValue, propertyMetadata)
        }
      }
    } else {
      /*
       * 3b) no metadata found
       */
      // let typeByConvention = typeByConvention(propertyKey);
      // if (typeByConvention) {
      //   /*
      //    * 4a) matches a convention
      //    */
      //   modelValue = mapperForConvention(typeByConvention).fromDb(attributeValue);
      // } else {
      /*
       * 4b) no naming convention matches
       */
      modelValue = fromDbOne(attributeValue)
      // }
    }

    Reflect.set(<any>model, propertyMetadata ? propertyMetadata.name : attributeName, modelValue)
    // throw new Error('don\'t know how to map without model class');
  })

  return model
}

export function fromDbOne<T>(attributeValue: Attribute, propertyMetadata?: PropertyMetadata<any, any>): T {
  const explicitType: AttributeValueType | null =
    propertyMetadata && propertyMetadata.typeInfo && propertyMetadata.typeInfo.isCustom
      ? propertyMetadata.typeInfo.type
      : null
  const type: AttributeValueType = explicitType || typeOfFromDb(attributeValue)

  if (explicitType) {
    return forType(type).fromDb(attributeValue, propertyMetadata)
  } else {
    return forType(type).fromDb(attributeValue)
  }
}

export function forType(type: AttributeValueType): MapperForType<any, Attribute> {
  let mapper = mapperForType.get(type)
  if (!mapper) {
    switch (type) {
      case String:
        mapper = StringMapper
        break
      case Number:
        mapper = NumberMapper
        break
      case Boolean:
        mapper = BooleanMapper
        break
      case EnumType:
        mapper = EnumMapper
        break
      case Map:
        // Maps support complex types as keys, we only support String & Number as Keys, otherwise a .toString() method should be implemented,
        // so we now how to save a  key
        // mapperForType = new MapMapper()
        throw new Error('Map is not supported to be mapped for now')
      case Array:
        mapper = CollectionMapper
        break
      case Set:
        mapper = CollectionMapper
        break
      case Object:
        mapper = ObjectMapper
        break
      case NullType:
        mapper = NullMapper
        break
      case Binary:
        // TODO LOW:BINARY add binary mapper
        throw new Error('no mapper for binary type implemented yet')
      case UndefinedType:
        mapper = ObjectMapper
        break
      default:
        mapper = ObjectMapper
      // throw new Error('no mapper defined for type ' + JSON.stringify(type))
    }
    mapperForType.set(type, mapper)
  }

  return mapper
}

export function getPropertyValue(item: any, propertyKey: PropertyKey): any {
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
      `there is no property descriptor for item ${JSON.stringify(item)} and property key ${<string>propertyKey}`,
    )
  }
}
