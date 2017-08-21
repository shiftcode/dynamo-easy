import { ModelConstructor } from '../model/model-constructor'
import { ModelMetadata } from './model-metadata.model'
import { KEY_MODEL, SecondaryIndex } from './model.decorator'
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

  getKeysWithUUID(): Array<PropertyMetadata<any>> {
    return this.filterBy(p => !!(p.key && p.key.uuid), [])
  }

  /**
   *
   * @returns {string}
   * @throws Throws an error if no partition key was defined for the current model
   */
  getPartitionKey(): string {
    const property = this.filterByFirst(p => !!(p.key && p.key.type === 'HASH'))

    if (property) {
      return property.nameDb
    } else {
      throw new Error('could not find any partition key')
    }
  }

  getSortKey(): string | null {
    const property = this.filterByFirst(p => !!(p.key && p.key.type === 'RANGE'))
    return property ? property.nameDb : null
  }

  getIndex(indexName: string): SecondaryIndex | null {
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

  private filterByFirst(predicate: (property: PropertyMetadata<any>) => boolean): PropertyMetadata<any> | null {
    const properties = this.filterBy(predicate, null)
    return properties && properties.length ? properties[0] : null
  }
}
