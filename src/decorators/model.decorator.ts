import { kebabCase } from 'lodash'
import { getMetadataType } from './decorators'
import { ModelData, ModelMetadata } from './model-metadata.model'
import { PropertyMetadata } from './property-metadata.model'
import { KEY_PROPERTY } from './property.decorator'
// FIXME should be optional dependency
import moment from 'moment'

export const KEY_MODEL = 'sc-reflect:model'

export function Model(opts: ModelData = {}): ClassDecorator {
  return function(constructor: Function) {
    // Make sure everything is valid
    const classType = getMetadataType(constructor)
    const type = constructor as any

    // get all the properties with @Property() annotation
    const properties: PropertyMetadata[] = Reflect.getOwnMetadata(KEY_PROPERTY, constructor)

    const transientProperties: string[] = properties && properties.length ? properties.filter(property => property.transient === true).map(property => property.key) : []

    const finalOpts = Object.assign<Partial<ModelMetadata>, Partial<ModelMetadata>, Partial<ModelMetadata>>(
      {},
      {
        clazz: constructor,
        clazzName: type.name,
        tableName: kebabCase(type.name),
        properties,
        transientProperties
      },
      opts
    )

    console.log(`Decorating: ${finalOpts.clazzName}`, finalOpts)
    Reflect.defineMetadata(KEY_MODEL, finalOpts, constructor)
  }
}
