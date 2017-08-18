import { ModelConstructor } from '../model/model-constructor'
import { Metadata } from './metadata'
import { ModelMetadata } from './model-metadata.model'
import { KEY_MODEL } from './model.decorator'
import { PropertyMetadata } from './property-metadata.model'

export class MetadataHelper {
  static get<T>(modelClass: ModelConstructor<T>): Metadata<T> {
    return new Metadata(modelClass)
  }

  static forModel<T>(modelClass: ModelConstructor<T>): ModelMetadata<T> {
    return Reflect.getMetadata(KEY_MODEL, modelClass)
  }

  static forProperty<T, K extends keyof T>(
    modelClass: ModelConstructor<T>,
    propertyKey: K
  ): PropertyMetadata<T[K]> | null {
    if (modelClass) {
      const modelMetadata: ModelMetadata<T> = Reflect.getMetadata(KEY_MODEL, modelClass)

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
