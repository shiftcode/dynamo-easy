import { ModelConstructor } from '../../model/model-constructor'
import { Metadata } from './metadata'

export function metadataForModel<T>(modelConstructor: ModelConstructor<T>): Metadata<T> {
  return new Metadata(modelConstructor)
}
