import { kebabCase } from 'lodash'
import { ModelMetadata } from '../../metadata/model-metadata.model'
import { PropertyMetadata } from '../../metadata/property-metadata.model'
// FIXME should be optional dependency
import { getMetadataType } from '../../util'
import { SecondaryIndex } from '../index/secondary-index'
import { KEY_PROPERTY } from '../property/property.decorator'
import { ModelData } from './model-data.model'

export const KEY_MODEL = 'sc-reflect:model'

/*
 * FIXME add validation for tableName
 * Table names and index names must be between 3 and 255 characters long, and can contain only the following characters:
a-z
A-Z
0-9
_ (underscore)
- (dash)
. (dot)
 */
export function Model(opts: ModelData = {}): ClassDecorator {
  // tslint:disable-next-line:ban-types
  return (constructor: Function) => {
    // Make sure everything is valid
    const classType = getMetadataType(constructor)
    const type = constructor as any

    // FIXME would better typing help with something
    // get all the properties with @Property() annotation
    const properties: Array<PropertyMetadata<any>> = Reflect.getOwnMetadata(KEY_PROPERTY, constructor)

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

    const transientProperties: string[] =
      properties && properties.length
        ? properties.filter(property => property.transient === true).map(property => property.name)
        : []

    const finalOpts = {
      clazz: constructor,
      clazzName: type.name,
      tableName: `${kebabCase(type.name)}s`,
      properties,
      transientProperties,
      indexes,
      ...opts,
    }

    // console.log(`Decorating: ${finalOpts.clazzName}`, finalOpts);
    Reflect.defineMetadata(KEY_MODEL, finalOpts, constructor)
  }
}

function getGlobalSecondaryIndexes(properties: Array<PropertyMetadata<any>>): Map<string, SecondaryIndex<any>> | null {
  if (properties && properties.length) {
    return properties
      .filter(property => property.keyForGSI && Object.keys(property.keyForGSI).length)
      .reduce((map, property: PropertyMetadata<any>): Map<string, SecondaryIndex<any>> => {
        let gsi: SecondaryIndex<any>
        Object.keys(property.keyForGSI!).forEach(indexName => {
          if (map.has(indexName)) {
            gsi = map.get(indexName)
          } else {
            gsi = <SecondaryIndex<any>>{}
          }

          switch (property.keyForGSI![indexName]) {
            case 'HASH':
              if (gsi.partitionKey) {
                throw new Error(
                  `there is already a partition key defined for global secondary index ${indexName} (property name: ${property.nameDb})`
                )
              }

              gsi.partitionKey = property.nameDb
              break
            case 'RANGE':
              if (gsi.sortKey) {
                throw new Error(
                  `there is already a sort key defined for global secondary index ${indexName} (property name: ${property.nameDb})`
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

function getLocalSecondaryIndexes(
  basePartitionKey: string | null,
  properties: Array<PropertyMetadata<any>>
): Map<string, SecondaryIndex<any>> | null {
  if (properties && properties.length) {
    return properties
      .filter(property => property.sortKeyForLSI && property.sortKeyForLSI.length)
      .reduce((map, property: PropertyMetadata<any>): Map<string, SecondaryIndex<any>> => {
        let lsi: SecondaryIndex<any>

        property.sortKeyForLSI!.forEach(indexName => {
          if (map.has(indexName)) {
            throw new Error(
              `only one sort key can be defined for the same local secondary index, ${property.nameDb} is already defined as sort key for index ${indexName}`
            )
          }

          if (!basePartitionKey) {
            throw new Error(
              'a local secondary index requires the partition key to be defined, use the @PartitionKey decorator'
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
