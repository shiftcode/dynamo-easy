import { ModelConstructor } from '../../model/model-constructor'
import { KEY_MODEL } from '../impl/model/key-model.const'
import { Metadata } from './metadata'
import { ModelMetadata } from './model-metadata.model'
import { PropertyMetadata } from './property-metadata.model'

export function metadataForClass<T>(modelConstructor: ModelConstructor<T>): Metadata<T> {
  return new Metadata(modelConstructor)
}

export function metadataForModel<T>(modelConstructor: ModelConstructor<T>): ModelMetadata<T> {
  const modelMetadata = Reflect.getMetadata(KEY_MODEL, modelConstructor)
  if (!modelMetadata) {
    throw new Error(`make sure the @Model decorator is present on the model ${modelConstructor.name}`)
  }

  return modelMetadata
}

/**
 *
 * @param {ModelConstructor<T>} modelConstructor
 * @param {keyof T} propertyKey Either the name of the property or the name of the
 * @returns {PropertyMetadata<T>}
 */
export function metadataForProperty<T>(
  modelConstructor: ModelConstructor<T>,
  propertyKey: keyof T | string,
): PropertyMetadata<T> | null {
  if (modelConstructor) {
    const modelMetadata: ModelMetadata<T> = Reflect.getMetadata(KEY_MODEL, modelConstructor)

    if (modelConstructor && !modelMetadata) {
      throw new Error(
        `make sure the @Model decorator was added to the given modelConstructor ${
          Object.hasOwnProperty('name') ? (<any>modelConstructor).name : modelConstructor
        }, was not able to find model metadata`,
      )
    }

    if (modelMetadata.properties) {
      return (
        modelMetadata.properties.find(property => property.name === propertyKey || property.nameDb === propertyKey) ||
        null
      )
    }
  }
  return null
}
