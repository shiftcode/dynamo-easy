import { AttributeModelType } from '../mapper/attribute-model-type.type'
import { Util } from '../mapper/util'
import { ModelConstructor } from '../model/model-constructor'
import { TypeInfo } from './property-metadata.model'
import { initOrUpdateProperty } from './property.decorator'

/**
 * Makes sure the property will be marshalled to a L(ist) type. The modelClass is required if the array items
 * have some property decorators, so we can retrieve this information using the model class.
 *
 * @param {ModelConstructor<any>} modelClass
 * @returns {PropertyDecorator}
 * @constructor
 */
// FIXME is there any improvement if we add generics to SortedSet<T> is it even possible?
export function SortedSet(modelClass?: ModelConstructor<any>): PropertyDecorator {
  return (target: any, propertyKey: string) => {
    const typeInfo: Partial<TypeInfo<Set<any>>> = <Partial<TypeInfo<Set<any>>>>{
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
