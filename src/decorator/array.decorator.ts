import { AttributeModelType } from '../mapper/attribute-model-type.type'
import { Util } from '../mapper/util'
import { ModelConstructor } from '../model/model-constructor'
import { getMetadataType } from './decorators'
import { TypeInfo } from './property-metadata.model'
import { AttributeModelTypes, initOrUpdateProperty, KEY_PROPERTY } from './property.decorator'

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
  return (target: any, propertyKey: string) => {
    const typeInfo: Partial<TypeInfo<T>> = <Partial<TypeInfo<T>>>{
      type: <any>Array,
      isCustom: true,
    }

    if (modelClass) {
      typeInfo.genericTypes = [modelClass]
    }

    initOrUpdateProperty({ typeInfo }, target, propertyKey)
  }
}
