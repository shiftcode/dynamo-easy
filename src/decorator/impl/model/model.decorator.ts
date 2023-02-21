/**
 * @module decorators
 */
import * as DynamoDB from '@aws-sdk/client-dynamodb'
import { kebabCase } from '../../../helper/kebab-case.function'
import { ModelMetadata } from '../../metadata/model-metadata.model'
import { PropertyMetadata } from '../../metadata/property-metadata.model'
import { SecondaryIndex } from '../index/secondary-index'
import { KEY_PROPERTY } from '../property/key-property.const'
import { modelErrors } from './errors.const'
import { KEY_MODEL } from './key-model.const'
import { ModelData } from './model-data.model'

/**
 * decorator to define a model for dynamo easy
 */
export function Model(opts: ModelData = {}): ClassDecorator {
  // tslint:disable-next-line:ban-types
  return (constructor: Function) => {
    const type = constructor as any

    // get all the properties with @Property() annotation (or @PartitionKey(),...)
    // if given class has own properties, all inherited properties are already set and we can get the properties with 'getOwnMetadata'.
    // otherwise when the given class does not have own properties, there's no 'ownMetadata' but we need to get them from the class it extends with 'getMetadata'
    const properties: Array<PropertyMetadata<any>> =
      (Reflect.hasOwnMetadata(KEY_PROPERTY, constructor)
        ? Reflect.getOwnMetadata(KEY_PROPERTY, constructor)
        : Reflect.getMetadata(KEY_PROPERTY, constructor)) || []

    // get partition key
    const partitionKeys = properties.filter((property) => property.key && property.key.type === 'HASH')

    const partitionKeyName: string | null = partitionKeys.length ? partitionKeys[0].nameDb : null

    /*
     * get the local and global secondary indexes
     */
    const globalSecondaryIndexes: any = getGlobalSecondaryIndexes(properties)
    const localSecondaryIndexes: any = getLocalSecondaryIndexes(partitionKeyName, properties)
    const indexes: Map<string, SecondaryIndex<any>> = new Map([...globalSecondaryIndexes, ...localSecondaryIndexes])

    const transientProperties = properties.length
      ? properties.filter((property) => property.transient === true).map((property) => property.name)
      : []

    const metaData: ModelMetadata<any> = {
      clazz: constructor,
      clazzName: type.name,
      tableName: `${kebabCase(type.name)}s`,
      properties,
      transientProperties,
      indexes,
      ...opts,
    }

    // console.log(`Decorating: ${metaData.clazzName}`, metaData);
    Reflect.defineMetadata(KEY_MODEL, metaData, constructor)
  }
}

/**
 * @hidden
 */
function testForGSI<T>(
  property: PropertyMetadata<T>,
): property is PropertyMetadata<T> & { keyForGSI: Record<string, DynamoDB.KeyType> } {
  return !!(property.keyForGSI && Object.keys(property.keyForGSI).length)
}

/**
 * @hidden
 */
function testForLSI<T>(property: PropertyMetadata<T>): property is PropertyMetadata<T> & { sortKeyForLSI: string[] } {
  return !!(property.sortKeyForLSI && property.sortKeyForLSI.length)
}

/**
 * @hidden
 */
function getGlobalSecondaryIndexes(properties: Array<PropertyMetadata<any>>): Map<string, SecondaryIndex<any>> {
  return properties.filter(testForGSI).reduce((map, property): Map<string, SecondaryIndex<any>> => {
    let gsi: SecondaryIndex<any>
    Object.keys(property.keyForGSI).forEach((indexName) => {
      if (map.has(indexName)) {
        gsi = map.get(indexName)
      } else {
        gsi = <SecondaryIndex<any>>{}
      }

      switch (property.keyForGSI[indexName]) {
        case 'HASH':
          if (gsi.partitionKey) {
            throw new Error(modelErrors.gsiMultiplePk(indexName, property.nameDb))
          }
          gsi.partitionKey = property.nameDb
          break
        case 'RANGE':
          if (gsi.sortKey) {
            throw new Error(modelErrors.gsiMultipleSk(indexName, property.nameDb))
          }
          gsi.sortKey = property.nameDb
          break
      }

      map.set(indexName, gsi)
    })

    return map
  }, new Map())
}

/**
 * @hidden
 */
function getLocalSecondaryIndexes(
  basePartitionKey: string | null,
  properties: Array<PropertyMetadata<any>>,
): Map<string, SecondaryIndex<any>> {
  return properties.filter(testForLSI).reduce((map, property): Map<string, SecondaryIndex<any>> => {
    let lsi: SecondaryIndex<any>

    property.sortKeyForLSI.forEach((indexName) => {
      if (map.has(indexName)) {
        throw new Error(modelErrors.lsiMultipleSk(indexName, property.nameDb))
      }

      if (!basePartitionKey) {
        throw new Error(modelErrors.lsiRequiresPk(indexName, property.nameDb))
      }

      lsi = {
        partitionKey: basePartitionKey,
        sortKey: property.nameDb,
      }

      map.set(indexName, lsi)
    })

    return map
  }, new Map())
}
