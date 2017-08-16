import { kebabCase } from "lodash"
import { getMetadataType } from "./decorators"
import { ModelData, ModelMetadata } from "./model-metadata.model"
import { PropertyMetadata } from "./property-metadata.model"
import { KEY_PROPERTY } from "./property.decorator"
// FIXME should be optional dependency
import moment from "moment"

export const KEY_MODEL = "sc-reflect:model"

/*
 * FIXME add validation for tableName
 * Table names and index names must be between 3 and 255 characters long, and can contain only the following characters:
a-z
A-Z
0-9
_ (underscore)
- (dash)
. (dot)
 */
export function Model<T>(opts: ModelData = {}): ClassDecorator {
  return function(constructor: Function) {
    // Make sure everything is valid
    const classType = getMetadataType(constructor)
    const type = constructor as any

    // FIXME would better typing help with something
    // get all the properties with @Property() annotation
    const properties: PropertyMetadata<any>[] = Reflect.getOwnMetadata(
      KEY_PROPERTY,
      constructor
    )

    const transientProperties: string[] =
      properties && properties.length
        ? properties
            .filter(property => property.transient === true)
            .map(property => property.name)
        : []

    const finalOpts = Object.assign<
      Partial<ModelMetadata<T>>,
      Partial<ModelMetadata<T>>,
      Partial<ModelMetadata<T>>
    >(
      {},
      {
        clazz: constructor,
        clazzName: type.name,
        tableName: kebabCase(type.name),
        properties,
        transientProperties,
      },
      opts
    )

    console.log(`Decorating: ${finalOpts.clazzName}`, finalOpts)
    Reflect.defineMetadata(KEY_MODEL, finalOpts, constructor)
  }
}
