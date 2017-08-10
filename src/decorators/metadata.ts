import { ModelClass } from "../model/model"
import { ModelMetadata } from "./model-metadata.model"
import { KEY_MODEL } from "./model.decorator"
import { PropertyMetadata } from "./property-metadata.model"

export class Metadata<T> {
  readonly modelOptions: ModelMetadata

  constructor(modelClass: ModelClass<T>) {
    this.modelOptions = Reflect.getMetadata(KEY_MODEL, modelClass)
  }

  forProperty(propertyKey: string): PropertyMetadata | undefined {
    let options: PropertyMetadata | undefined

    if (this.modelOptions.properties) {
      options = this.modelOptions.properties.find(
        property => property.key === propertyKey
      )
    }

    return options
  }
}

export class MetadataHelper {
  static get<T>(modelClass: ModelClass<T>): Metadata<T> {
    return new Metadata(modelClass)
  }

  static forModel<T>(modelClass: ModelClass<T>): ModelMetadata {
    return Reflect.getMetadata(KEY_MODEL, modelClass)
  }

  static forProperty<T>(
    modelClass: ModelClass<T>,
    propertyKey: keyof T
  ): PropertyMetadata {
    let modelOptions = Reflect.getMetadata(KEY_MODEL, modelClass)

    let options: PropertyMetadata | undefined
    if (modelOptions.properties) {
      options = modelOptions.properties.find(
        property => property.key === propertyKey
      )
    }

    return options
  }
}
