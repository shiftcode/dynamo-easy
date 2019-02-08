import { ModelConstructor } from '../../model/model-constructor'
import { Metadata } from './metadata'

/**
 * create the metadata wrapper instance for a @Model() decorated class.
 */
export function metadataForModel<T>(modelConstructor: ModelConstructor<T>): Metadata<T> {
  return new Metadata(modelConstructor)
}
