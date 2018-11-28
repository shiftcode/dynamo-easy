import { initOrUpdateProperty } from '../property/init-or-update-property.function'

export function Transient(): PropertyDecorator {
  return (target: any, propertyKey: string | symbol) => {
    if (typeof propertyKey === 'string') {
      initOrUpdateProperty({ transient: true }, target, propertyKey)
    }
  }
}
