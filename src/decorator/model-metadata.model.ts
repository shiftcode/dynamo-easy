import { SecondaryIndex } from './model.decorator'
import { PropertyMetadata } from './property-metadata.model'

export interface ModelData {
  tableName?: string
}

/**
 * Options provided to model
 * decorator annotation
 */
export interface ModelMetadata<T> {
  clazzName?: string
  clazz?: any
  tableName?: string
  properties?: Array<PropertyMetadata<T[keyof T]>>
  transientProperties?: string[]

  // local and global secondary indexes maps the name to the index definition (partition and optional sort key depending on index type)
  indexes: Map<string, SecondaryIndex>
}
