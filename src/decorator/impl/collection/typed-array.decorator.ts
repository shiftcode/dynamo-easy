import { ModelConstructor } from '../../../model/model-constructor'
import { TypeInfo } from '../../metadata/property-metadata.model'
import { initOrUpdateProperty } from '../property/property.decorator'

/**
 * Makes sure the property will be mapped to a L(ist) type. The modelClass is required if the collection items
 * have some property decorators, so we can retrieve this information using the model class.
 */
export function TypedArray<T>(modelClass?: ModelConstructor<T>): PropertyDecorator {
  return (target: object, propertyKey: string | symbol) => {
    if (typeof propertyKey === 'string') {
      const typeInfo: TypeInfo = {
        type: Array,
        isCustom: true,
      }

      if (modelClass) {
        typeInfo.genericType = modelClass
      }

      initOrUpdateProperty({ typeInfo }, target, propertyKey)
    }
  }
}
