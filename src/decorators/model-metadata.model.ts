import { PropertyMetadata } from './property-metadata.model'

export interface ModelData {
  tableName?: string
}

/**
 * Options provided to model
 * decorator annotation
 */
export interface ModelMetadata {
  clazzName?: string
  clazz?: any
  tableName?: string
  properties?: PropertyMetadata[]
  transientProperties?: string[]
}
