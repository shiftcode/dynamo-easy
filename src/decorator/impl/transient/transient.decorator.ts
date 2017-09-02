import { initOrUpdateProperty } from '../property/property.decorator'

export function Transient(): PropertyDecorator {
  return (target: any, propertyKey: string) => {
    initOrUpdateProperty({ transient: true }, target, propertyKey)
  }
}
