/**
 * @module mapper
 */
import { hasSortKey, Metadata } from '../decorator/metadata/metadata'
import { metadataForModel } from '../decorator/metadata/metadata-for-model.function'
import { hasType, Key, PropertyMetadata } from '../decorator/metadata/property-metadata.model'
import { createOptModelLogger } from '../logger/logger'
import { ModelConstructor } from '../model/model-constructor'
import { MapperForType } from './for-type/base.mapper'
import { BooleanMapper } from './for-type/boolean.mapper'
import { CollectionMapper } from './for-type/collection.mapper'
import { NullMapper } from './for-type/null.mapper'
import { NumberMapper } from './for-type/number.mapper'
import { ObjectMapper } from './for-type/object.mapper'
import { StringMapper } from './for-type/string.mapper'
import { AttributeValueType } from './type/attribute-value-type.type'
import { Attribute, Attributes } from './type/attribute.type'
import { Binary } from './type/binary.type'
import { NullType } from './type/null.type'
import { UndefinedType } from './type/undefined.type'
import { getPropertyPath, typeOf, typeOfFromDb } from './util'

/**
 * @hidden
 */
const mapperForType: Map<AttributeValueType, MapperForType<any, any>> = new Map()

/**
 * @hidden
 */
const logger = createOptModelLogger('dynamo.mapper.mapper')

/**
 * mapps an item according to given model constructor [its meta data] to attributes
 */
export function toDb<T>(item: T, modelConstructor?: ModelConstructor<T>): Attributes<T> {
  logger.verbose('map toDb', modelConstructor, { item })
  const mapped = <Attributes<T>>{}

  if (modelConstructor) {
    const metadata: Metadata<T> = metadataForModel(modelConstructor)

    /*
     * initialize possible properties with default value providers
     */
    if (metadata) {
      metadata.getPropertiesWithDefaultValueProvider().forEach((propertyMetadata) => {
        const currentVal = Reflect.get(<any>item, propertyMetadata.name)
        if (currentVal === undefined || currentVal === null) {
          // tslint:disable-next-line:no-non-null-assertion
          Reflect.set(<any>item, propertyMetadata.name, propertyMetadata.defaultValueProvider!())
        }
      })
    }
  }

  const propertyNames = <Array<keyof T>>Object.getOwnPropertyNames(item) || []
  propertyNames.forEach((propertyKey) => {
    /*
     * 1) get the value of the property
     */
    const propertyValue = getPropertyValue(item, propertyKey)

    let attributeValue: Attribute | undefined | null

    if (propertyValue === undefined) {
      // noop ignore because we can't map it
    } else {
      /*
       * 2) decide how to map the property depending on type or value
       */

      let propertyMetadata: PropertyMetadata<T, any> | null | undefined
      if (modelConstructor) {
        propertyMetadata = metadataForModel(modelConstructor).forProperty(propertyKey)
      }

      if (propertyMetadata) {
        if (propertyMetadata.transient) {
          // 3a_1) skip transient property
        } else {
          // 3a_2) property metadata is defined and property is not marked not transient
          attributeValue = toDbOne(propertyValue, getPropertyPath<T>(modelConstructor, propertyKey), propertyMetadata)
        }
      } else {
        // 3b) no metadata found
        attributeValue = toDbOne(propertyValue, getPropertyPath<T>(modelConstructor, propertyKey))
      }

      if (attributeValue === undefined) {
        // no-op transient field, just ignore it
      } else if (attributeValue === null) {
        // empty values will be ignored too
      } else {
        ;(<any>mapped)[propertyMetadata ? propertyMetadata.nameDb : propertyKey] = attributeValue
      }
    }
  })

  return mapped
}

/**
 * maps a js value to its dynamoDB attribute
 * @param propertyValue The value which should be mapped
 * @param propertyMetadata Some optional metadata
 */
export function toDbOne(propertyValue: any, propertyMetadata?: PropertyMetadata<any>): Attribute | null

/**
 * maps a js value to its dynamoDB attribute.
 * You can provide the property path to have a more verbose output
 *
 * @param propertyValue The value which should be mapped
 * @param propertyPath The property path is only used for logging purposes
 * @param propertyMetadata Some optional metadata
 */
export function toDbOne(
  propertyValue: any,
  propertyPath: string,
  propertyMetadata?: PropertyMetadata<any>,
): Attribute | null
export function toDbOne(
  propertyValue: any,
  propertyPathOrMetadata?: string | PropertyMetadata<any>,
  propertyMetadata?: PropertyMetadata<any>,
): Attribute | null {
  logger.verbose('map toDbOne', null, { propertyValue, propertyPathOrMetadata, propertyMetadata })
  const propertyPath =
    propertyPathOrMetadata && typeof propertyPathOrMetadata === 'string' ? propertyPathOrMetadata : null
  propertyMetadata =
    propertyPathOrMetadata && typeof propertyPathOrMetadata !== 'string' ? propertyPathOrMetadata : propertyMetadata

  const explicitType: AttributeValueType | null = hasType(propertyMetadata) ? propertyMetadata.typeInfo.type : null
  const type: AttributeValueType = explicitType || typeOf(propertyValue, propertyPath)

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

/**
 * @hidden
 */
function testForKey<T>(p: PropertyMetadata<T>): p is PropertyMetadata<T> & { key: Key } {
  return !!p.key
}

/**
 * returns the function for the given ModelConstructor to create the AttributeMap with HASH (and RANGE) Key of a given item.
 * @param modelConstructor
 */
export function createToKeyFn<T>(modelConstructor: ModelConstructor<T>): (item: Partial<T>) => Attributes<T> {
  const metadata = metadataForModel(modelConstructor)
  const properties = metadata.modelOptions.properties
  if (!properties.length) {
    throw new Error('no properties defined on metadata')
  }

  const keyProperties = properties.filter(testForKey)

  return (item: Partial<T>) => {
    logger.verbose('create key', null, { item, propertyMeta: keyProperties })
    return keyProperties.reduce((key, propMeta) => {
      if (item[propMeta.name] === null || item[propMeta.name] === undefined) {
        throw new Error(`there is no value for property ${propMeta.name.toString()} but is ${propMeta.key.type} key`)
      }
      const propertyValue = getPropertyValue(item, propMeta.name)
      ;(key as any)[propMeta.nameDb] = toDbOne(propertyValue, propMeta)
      return key
    }, <Attributes<T>>{})
  }
}

/**
 * creates toKeyFn and applies item to it.
 * @see {@link createToKeyFn}
 */
export function toKey<T>(item: T, modelConstructor: ModelConstructor<T>): Attributes<T> {
  return createToKeyFn(modelConstructor)(item)
}

/**
 * @hidden
 */
export function createKeyAttributes<T>(
  metadata: Metadata<T>,
  partitionKey: any,
  sortKey?: any,
): Attributes<Partial<T>> {
  const partitionKeyProp = metadata.getPartitionKey()

  const partitionKeyMetadata = metadata.forProperty(partitionKeyProp)

  if (!partitionKeyMetadata) {
    throw new Error('metadata for partition key must be defined')
  }

  const keyAttributeMap = <Attributes<T>>{
    [partitionKeyMetadata.nameDb]: toDbOne(partitionKey, partitionKeyMetadata),
  }

  if (hasSortKey(metadata)) {
    if (sortKey === null || sortKey === undefined) {
      throw new Error(`please provide the sort key for attribute ${String(metadata.getSortKey())}`)
    }
    const sortKeyProp = metadata.getSortKey()
    const sortKeyMetadata = metadata.forProperty(sortKeyProp)
    if (!sortKeyMetadata) {
      throw new Error('metadata for sort key must be defined')
    }

    ;(keyAttributeMap as any)[sortKeyMetadata.nameDb] = toDbOne(sortKey, sortKeyMetadata)
  }

  return keyAttributeMap
}

/**
 * parses attributes to a js item according to the given model constructor [its meta data]
 */
export function fromDb<T>(attributeMap: Attributes<T>, modelConstructor?: ModelConstructor<T>): T {
  logger.verbose('parse fromDb', modelConstructor, { attributeMap })
  const model: T = <T>{}

  Object.getOwnPropertyNames(attributeMap).forEach((attributeName) => {
    /*
     * 1) get the value of the property
     */
    const attributeValue = (<any>attributeMap)[attributeName]

    /*
     * 2) decide how to map the property depending on type or value
     */
    let modelValue: T | undefined
    let propertyMetadata: PropertyMetadata<any, any> | null | undefined
    if (modelConstructor) {
      propertyMetadata = metadataForModel(modelConstructor).forProperty(attributeName)
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
      modelValue = fromDbOne(attributeValue)
    }

    if (modelValue !== undefined) {
      Reflect.set(<any>model, propertyMetadata ? propertyMetadata.name : attributeName, modelValue)
    }
  })

  return model
}

/**
 * parses an attribute to a js value according to the given property metadata
 */
export function fromDbOne<T>(attributeValue: Attribute, propertyMetadata?: PropertyMetadata<any, any>): T {
  logger.verbose('parse fromDbOne', null, { attributeValue, propertyMetadata })
  const explicitType: AttributeValueType | null = hasType(propertyMetadata) ? propertyMetadata.typeInfo.type : null
  const type: AttributeValueType = explicitType || typeOfFromDb(attributeValue)

  if (explicitType) {
    return forType(type).fromDb(attributeValue, propertyMetadata)
  } else {
    return forType(type).fromDb(attributeValue)
  }
}

/**
 * @hidden
 */
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
      case NullType:
        mapper = NullMapper
        break
      case Binary:
        // The applications must encode binary values in base64-encoded format before sending them to DynamoDB.
        // Upon receipt of these values,
        // DynamoDB decodes the data into an unsigned byte array and uses that as the length of the binary attribute.
        throw new Error('no mapper for binary type implemented yet')
      case UndefinedType:
        mapper = ObjectMapper
        break
      case Object:
      default:
        // return ObjectMapper as default to support nested @Model decorated classes (nested complex classes)
        // just note that the property still needs @Property decoration to get the metadata of the complex type
        mapper = ObjectMapper
    }
    mapperForType.set(type, mapper)
  }

  return mapper
}

/**
 * @hidden
 */
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
