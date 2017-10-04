import { ModelConstructor } from '../../../model/model-constructor'
import { TypeInfo } from '../../metadata/property-metadata.model'
import { AttributeModelTypes, initOrUpdateProperty, KEY_PROPERTY } from '../property/property.decorator'

/**
 * Makes sure the property will be marshalled to a L(ist) type. The modelClass is required if the collection items
 * have some property decorators, so we can retrieve this information using the model class.
 */
export function TypedArray<T>(modelClass?: ModelConstructor<T>): PropertyDecorator {
  return (target: any, propertyKey: string) => {
    const typeInfo: Partial<TypeInfo> = <Partial<TypeInfo>>{
      type: Array,
      isCustom: true,
    }

    if (modelClass) {
      typeInfo.genericTypes = [modelClass]
    }

    initOrUpdateProperty({ typeInfo }, target, propertyKey)
  }
}
