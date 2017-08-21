import { kebabCase } from 'lodash-es'
// FIXME should be optional dependency
import { getMetadataType } from './decorators'
import { ModelData, ModelMetadata } from './model-metadata.model'
import { PropertyMetadata } from './property-metadata.model'
import { KEY_PROPERTY } from './property.decorator'

export const KEY_MODEL = 'sc-reflect:model'

export interface SecondaryIndex {
  partitionKey: string
  sortKey?: string
}

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
    const indexes: Map<string, SecondaryIndex> = new Map([...globalSecondaryIndexes, ...localSecondaryIndexes])

    const transientProperties: string[] =
      properties && properties.length
        ? properties.filter(property => property.transient === true).map(property => property.name)
        : []

    const finalOpts = {
      clazz: constructor,
      clazzName: type.name,
      tableName: kebabCase(type.name),
      properties,
      transientProperties,
      indexes,
      ...opts,
    }
    // indexes,

    // console.log(`Decorating: ${finalOpts.clazzName}`, finalOpts);
    Reflect.defineMetadata(KEY_MODEL, finalOpts, constructor)
  }
}

// TODO VALIDATION only 5 gsi are allowed per table
function getGlobalSecondaryIndexes(properties: Array<PropertyMetadata<any>>): Map<string, SecondaryIndex> | null {
  if (properties && properties.length) {
    return properties
      .filter(property => property.keyForGSI && Object.keys(property.keyForGSI).length)
      .reduce((map, property: PropertyMetadata<any>): Map<string, SecondaryIndex> => {
        let gsi: SecondaryIndex
        Object.keys(property.keyForGSI).forEach(indexName => {
          if (map.has(indexName)) {
            gsi = map.get(indexName)
          } else {
            gsi = <SecondaryIndex>{}
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
              if (gsi.partitionKey) {
                throw new Error(
                  `there is already a sort key defined for global secondary index ${indexName} (property name: ${property.nameDb})`
                )
              }

              gsi.sortKey = property.nameDb
              break
          }

          map.set(indexName, gsi)
        })

        return map
      }, new Map())
  } else {
    return null
  }
}

// TODO VALIDATION only 5 gsi are allowed per table
function getLocalSecondaryIndexes(
  basePartitionKey: string | null,
  properties: Array<PropertyMetadata<any>>
): Map<string, SecondaryIndex> | null {
  if (properties && properties.length) {
    return properties
      .filter(property => property.sortKeyForLSI && property.sortKeyForLSI.length)
      .reduce((map, property: PropertyMetadata<any>): Map<string, SecondaryIndex> => {
        let lsi: SecondaryIndex

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
