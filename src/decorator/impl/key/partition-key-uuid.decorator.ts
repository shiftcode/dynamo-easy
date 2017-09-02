import { initOrUpdateProperty } from '../property/property.decorator'

export function PartitionKeyUUID(): PropertyDecorator {
  return (target: any, propertyKey: string) => {
    initOrUpdateProperty({ key: { type: 'HASH', uuid: true } }, target, propertyKey)
  }
}
