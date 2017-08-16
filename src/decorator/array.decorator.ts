import { Util } from '../mapper/util'
import { ModelConstructor } from '../model/model-constructor'
import { AttributeModelTypes, initOrUpdateProperty, KEY_PROPERTY } from './property.decorator'
import { TypeInfo } from './property-metadata.model'
import { getMetadataType } from './decorators'
import { MetadataHelper } from './metadata'
import { AttributeModelType } from '../mapper/attribute-model-type.type'

/**
 * Makes sure the property will be marshalled to a L(ist) type. The modelClass is required if the array items
 * have some property decorators, so we can retrieve this information using the model class.
 *
 * @param {ModelConstructor<any>} modelClass
 * @returns {PropertyDecorator}
 * @constructor
 *
 * FIXME rename (collision with es.Array)
 */
export function TypedArray<T>(modelClass?: ModelConstructor<T>): PropertyDecorator {
  return function(target: any, propertyKey: string) {
    const typeInfo: Partial<TypeInfo<T>> = <Partial<TypeInfo<T>>>{
      type: <any>Array,
      isCustom: true,
    }

    if (modelClass) {
      typeInfo.genericTypes = [modelClass]
    }

    initOrUpdateProperty({ typeInfo: typeInfo }, target, propertyKey)
  }
}
