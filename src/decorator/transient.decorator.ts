import { initOrUpdateProperty } from "./property.decorator"

export function Transient(): PropertyDecorator {
  return function(target: any, propertyKey: string) {
    initOrUpdateProperty({ transient: true }, target, propertyKey)
  }
}
