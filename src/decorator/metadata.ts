import { ModelConstructor } from '../model/model-constructor'
import { ModelMetadata } from './model-metadata.model'
import { KEY_MODEL, LocalSecondaryIndex, SecondaryIndex } from './model.decorator'
import { PropertyMetadata } from './property-metadata.model'

export class Metadata<T> {
  readonly modelOptions: ModelMetadata<T>

  constructor(modelClass: ModelConstructor<T>) {
    this.modelOptions = Reflect.getMetadata(KEY_MODEL, modelClass)
  }

  forProperty<K extends keyof T>(propertyKey: K): PropertyMetadata<T[K]> | undefined {
    let options: PropertyMetadata<T[K]> | undefined

    if (this.modelOptions.properties) {
      options = this.modelOptions.properties.find(property => property.name === propertyKey)
    }

    return options
  }

  getKeysWithUUID(): Array<PropertyMetadata<any>> {
    return this.filterBy(p => p.key && p.key.uuid, [])
  }

  getPartitionKey(): string | null {
    const property = this.filterByFirst(p => p.key && p.key.type === 'HASH')
    return property ? property.nameDb : null
  }

  getSortKey(): string | null {
    const property = this.filterByFirst(p => p.key && p.key.type === 'RANGE')
    return property ? property.nameDb : null
  }

  getIndex(indexName: string): SecondaryIndex | null {
    if (this.modelOptions.indexes) {
      return this.modelOptions.indexes.get(indexName)
    }

    return null
  }

  private filterBy<R>(predicate: (property: PropertyMetadata<any>) => boolean, defaultValue: R = null): Array<PropertyMetadata<any>> | R {
    if (this.modelOptions && this.modelOptions.properties) {
      const properties = this.modelOptions.properties.filter(predicate)
      if (properties && properties.length) {
        return properties
      }
    }

    return defaultValue
  }

  private filterByFirst(predicate: (property: PropertyMetadata<any>) => boolean): PropertyMetadata<any> | null {
    const properties = this.filterBy<null>(predicate)
    return properties && properties.length ? properties[0] : null
  }
}

export class MetadataHelper {
  static get<T>(modelClass: ModelConstructor<T>): Metadata<T> {
    return new Metadata(modelClass)
  }

  static forModel<T>(modelClass: ModelConstructor<T>): ModelMetadata<T> {
    return Reflect.getMetadata(KEY_MODEL, modelClass)
  }

  static forProperty<T, K extends keyof T>(modelClass: ModelConstructor<T>, propertyKey: K): PropertyMetadata<T[K]> | null {
    if (modelClass) {
      let modelMetadata: ModelMetadata<T> = Reflect.getMetadata(KEY_MODEL, modelClass)

      if (modelClass && !modelMetadata) {
        throw new Error(
          `make sure the @Model decorator was added to the given modelClass ${Object.hasOwnProperty('name')
            ? (<any>modelClass).name
            : modelClass}, was not able to find model metadata`
        )
      }

      let options: PropertyMetadata<T[K]> | undefined
      if (modelMetadata.properties) {
        options = modelMetadata.properties.find(property => property.name === propertyKey)
      }

      return options
    } else {
      return null
    }
  }
}
