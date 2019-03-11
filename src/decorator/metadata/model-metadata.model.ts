/**
 * @module metadata
 */
import { SecondaryIndex } from '../impl/index/secondary-index'
import { PropertyMetadata } from './property-metadata.model'

/**
 * Options provided to model decorator annotation
 */
export interface ModelMetadata<T> {
  /**
   * clazzName using constructor.name, be aware of changes between development & production environments when using
   * uglify tooling
   */
  clazzName: string
  clazz: any
  tableName: string
  properties?: Array<PropertyMetadata<T>>
  transientProperties?: Array<string | number | symbol>

  // local and global secondary indexes maps the name to the index definition (partition and optional sort key depending on index type)
  indexes?: Map<string, SecondaryIndex<T>>
}
