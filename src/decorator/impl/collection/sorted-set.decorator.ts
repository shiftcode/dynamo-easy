import { AttributeModelType } from '../../../mapper/type/attribute-model.type'
import { Util } from '../../../mapper/util'
import { ModelConstructor } from '../../../model/model-constructor'
import { TypeInfo } from '../../metadata/property-metadata.model'
import { initOrUpdateProperty } from '../property/property.decorator'

/**
 * Makes sure the property will be marshalled to a L(ist) type. The modelClass is required if the array items
 * have some property decorators, so we can retrieve this information using the model class.
 */
// FIXME is there any improvement if we add generics to SortedSet<T> is it even possible?
export function SortedSet(modelClass?: ModelConstructor<any>): PropertyDecorator {
  return (target: any, propertyKey: string) => {
    const typeInfo: Partial<TypeInfo> = <Partial<TypeInfo>>{
      type: Set,
      typeName: 'Set',
      isCustom: true,
    }

    if (modelClass) {
      typeInfo.genericTypes = [modelClass]
    }

    initOrUpdateProperty({ isSortedCollection: true, typeInfo }, target, propertyKey)
  }
}
