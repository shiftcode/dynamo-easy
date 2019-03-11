/**
 * @module decorators
 */
import * as DynamoDB from 'aws-sdk/clients/dynamodb'
import { ModelMetadata } from '../../metadata/model-metadata.model'
import { PropertyMetadata } from '../../metadata/property-metadata.model'
import { SecondaryIndex } from '../index/secondary-index'
import { KEY_PROPERTY } from '../property/key-property.const'
import { KEY_MODEL } from './key-model.const'
import { ModelData } from './model-data.model'

/**
 * decorator to define a model for dynamo easy
 */
export function Model(opts: ModelData): ClassDecorator {
  // tslint:disable-next-line:ban-types
  return (constructor: Function) => {
    const type = constructor as any

    // get all the properties with @Property() annotation (or @PartitionKey(),...)
    // if given class has own properties, all inherited properties are already set and we can get the properties with 'getOwnMetadata'.
    // otherwise when the given class does not have own properties, there's no 'ownMetadata' but we need to get them from the class it extends with 'getMetadata'
    const properties: Array<PropertyMetadata<any>> = Reflect.hasOwnMetadata(KEY_PROPERTY, constructor)
      ? Reflect.getOwnMetadata(KEY_PROPERTY, constructor)
      : Reflect.getMetadata(KEY_PROPERTY, constructor)

    // get partition key
    const partitionKeys = properties
      ? properties.filter(property => property.key && property.key.type === 'HASH')
      : null
    const partitionKeyName: string | null = partitionKeys && partitionKeys.length ? partitionKeys[0].nameDb : null

    /*
     * get the local and global secondary indexes
     */
    const globalSecondaryIndexes: any = getGlobalSecondaryIndexes(properties) || []
    const localSecondaryIndexes: any = getLocalSecondaryIndexes(partitionKeyName, properties) || []
    const indexes: Map<string, SecondaryIndex<any>> = new Map([...globalSecondaryIndexes, ...localSecondaryIndexes])

    const transientProperties =
      properties && properties.length
        ? properties.filter(property => property.transient === true).map(property => property.name)
        : []

    const metaData: ModelMetadata<any> = {
      clazz: constructor,
      clazzName: type.name,
      properties,
      transientProperties,
      indexes,
      ...opts,
    }

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
function getGlobalSecondaryIndexes(properties: Array<PropertyMetadata<any>>): Map<string, SecondaryIndex<any>> | null {
  if (properties && properties.length) {
    return properties.filter(testForGSI).reduce((map, property): Map<string, SecondaryIndex<any>> => {
      let gsi: SecondaryIndex<any>
      Object.keys(property.keyForGSI).forEach(indexName => {
        if (map.has(indexName)) {
          gsi = map.get(indexName)
        } else {
          gsi = <SecondaryIndex<any>>{}
        }

        switch (property.keyForGSI[indexName]) {
          case 'HASH':
            if (gsi.partitionKey) {
              throw new Error(
                `there is already a partition key defined for global secondary index ${indexName} (property name: ${
                  property.nameDb
                })`,
              )
            }

            gsi.partitionKey = property.nameDb
            break
          case 'RANGE':
            if (gsi.sortKey) {
              throw new Error(
                `there is already a sort key defined for global secondary index ${indexName} (property name: ${
                  property.nameDb
                })`,
              )
            }

            gsi.sortKey = property.nameDb
            break
        }

        if (map.has(indexName)) {
          map.set(indexName, gsi)
        } else {
          if (map.size < 5) {
            map.set(indexName, gsi)
          } else {
            // a maximum of 5 global secondary indexes can be defined per table
            throw new Error('make sure to define no more than 5 global secondary indexes per model')
          }
        }
      })

      return map
    }, new Map())
  } else {
    return null
  }
}

/**
 * @hidden
 */
function getLocalSecondaryIndexes(
  basePartitionKey: string | null,
  properties: Array<PropertyMetadata<any>>,
): Map<string, SecondaryIndex<any>> | null {
  if (properties && properties.length) {
    return properties.filter(testForLSI).reduce((map, property): Map<string, SecondaryIndex<any>> => {
      let lsi: SecondaryIndex<any>

      property.sortKeyForLSI.forEach(indexName => {
        if (map.has(indexName)) {
          throw new Error(
            `only one sort key can be defined for the same local secondary index, ${
              property.nameDb
            } is already defined as sort key for index ${indexName}`,
          )
        }

        if (!basePartitionKey) {
          throw new Error(
            'a local secondary index requires the partition key to be defined, use the @PartitionKey decorator',
          )
        }

        lsi = {
          partitionKey: basePartitionKey,
          sortKey: property.nameDb,
        }

        map.set(indexName, lsi)
      })

      return map
    }, new Map())
  } else {
    return null
  }
}
