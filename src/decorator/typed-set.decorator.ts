import { Util } from '../mapper/util'
import { ModelConstructor } from '../model/model-constructor'
import { TypeInfo } from './property-metadata.model'
import { initOrUpdateProperty } from './property.decorator'

/**
 * Makes sure the property will be marshalled to a S(et) type. The modelClass is required for additional type saftey
 * or if the items have a complex type
 *
 * @param {ModelConstructor<any>} modelClass
 * @returns {PropertyDecorator}
 * @constructor
 */
// TODO TypedSet naming is somewhat misleading, because it does not require a type, it is always typed thats true
// FIXME is there any improvement if we add generics to SortedSet<T> is it even possible?
export function TypedSet(modelClass?: ModelConstructor<any>): PropertyDecorator {
  return (target: any, propertyKey: string) => {
    const typeInfo: Partial<TypeInfo<Set<any>>> = <Partial<TypeInfo<Set<any>>>>{
      type: Set,
      typeName: 'Set',
      isCustom: true,
    }

    if (modelClass) {
      typeInfo.genericTypes = [modelClass]
    }

    initOrUpdateProperty({ typeInfo }, target, propertyKey)
  }
}
