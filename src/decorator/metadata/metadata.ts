import { ModelConstructor } from '../../model/model-constructor'
import { SecondaryIndex } from '../impl/index/secondary-index'
import { KEY_MODEL } from '../impl/model/model.decorator'
import { ModelMetadata } from './model-metadata.model'
import { PropertyMetadata } from './property-metadata.model'

export class Metadata<T> {
  readonly modelOptions: ModelMetadata<T>

  constructor(modelClass: ModelConstructor<T>) {
    this.modelOptions = Reflect.getMetadata(KEY_MODEL, modelClass)
  }

  forProperty(propertyKey: keyof T | string): PropertyMetadata<T> | undefined {
    let options: PropertyMetadata<T> | undefined

    if (this.modelOptions.properties) {
      options = this.modelOptions.properties.find(
        property => property.name === propertyKey || property.nameDb === propertyKey
      )
    }

    return options
  }

  /**
   *
   * @returns {Array<PropertyMetadata<any>>} Returns all the properties property the @PartitionKeyUUID decorator is present, returns an empty array by default
   */
  getKeysWithUUID(): Array<PropertyMetadata<any>> {
    return this.filterBy(p => !!(p.key && p.key.uuid), [])
  }

  /**
   * @param {string} indexName
   * @returns {string} Returns the name of partition key (not the db name if it differs from property name)
   * @throws Throws an error if no partition key was defined for the current model
   * @throws Throws an error if an indexName was delivered but no index was found for given name
   */
  getPartitionKey(indexName?: string): keyof T {
    if (indexName) {
      const index = this.getIndex(indexName)
      if (index) {
        return index.partitionKey
      } else {
        throw new Error(`there is no index defined for name ${indexName}`)
      }
    } else {
      const property = this.filterByFirst(p => !!(p.key && p.key.type === 'HASH'))

      if (property) {
        return property.name
      } else {
        throw new Error('could not find any partition key')
      }
    }
  }

  /**
   * @param {string} indexName
   * @returns {keyof T} Returns the name of sort key (not the db name if it differs from property name) or null if none was defined
   * @throws Throws an error if an indexName was delivered but no index was found for given name or the found index has no sort key defined
   */
  getSortKey(indexName?: string): keyof T | null {
    if (indexName) {
      const index = this.getIndex(indexName)
      if (index) {
        if (index.sortKey) {
          return index.sortKey
        } else {
          throw new Error(`there is no sort key defined for index ${indexName}`)
        }
      } else {
        throw new Error(`there is no index defined for name ${indexName}`)
      }
    } else {
      const property = this.filterByFirst(p => !!(p.key && p.key.type === 'RANGE'))
      return property ? property.name : null
    }
  }

  /**
   *
   * @returns {SecondaryIndex[]} Returns all the secondary indexes if exists or an empty array if none is defined
   */
  getIndexes(): Array<SecondaryIndex<T>> {
    if (this.modelOptions.indexes && this.modelOptions.indexes.size) {
      return Array.from(this.modelOptions.indexes.values())
    } else {
      return []
    }
  }

  /**
   * @param {string} indexName
   * @returns {SecondaryIndex} Returns the index if one with given name exists, null otherwise
   */
  getIndex(indexName: string): SecondaryIndex<T> | null {
    if (this.modelOptions.indexes) {
      const index = this.modelOptions.indexes.get(indexName)
      return index ? index : null
    }

    return null
  }

  private filterBy<R>(
    predicate: (property: PropertyMetadata<any>) => boolean,
    defaultValue: R
  ): Array<PropertyMetadata<any>> | R {
    if (this.modelOptions && this.modelOptions.properties) {
      const properties = this.modelOptions.properties.filter(predicate)
      if (properties && properties.length) {
        return properties
      }
    }

    return defaultValue
  }

  private filterByFirst(predicate: (property: PropertyMetadata<T>) => boolean): PropertyMetadata<T> | null {
    const properties = this.filterBy(predicate, null)
    return properties && properties.length ? properties[0] : null
  }
}
