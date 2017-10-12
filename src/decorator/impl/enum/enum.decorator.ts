import { EnumType } from '../../../mapper/type/enum.type'
import { initOrUpdateProperty } from '../property/property.decorator'

export function Enum<T>(enumType?: T): PropertyDecorator {
  return (target: any, propertyKey: string) => {
    initOrUpdateProperty({ typeInfo: { type: EnumType, isCustom: true } }, target, propertyKey)
  }
}
