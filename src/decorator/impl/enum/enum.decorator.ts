import { EnumType } from '../../../mapper/type/enum.type'
import { initOrUpdateProperty } from '../property/init-or-update-property.function'

export function Enum<T>(enumType?: T): PropertyDecorator {
  return (target: any, propertyKey: string | symbol) => {
    if (typeof propertyKey === 'string') {
      initOrUpdateProperty({ typeInfo: { type: EnumType, isCustom: true } }, target, propertyKey)
    }
  }
}
