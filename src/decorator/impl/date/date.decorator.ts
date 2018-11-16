import { DynamoEasyConfig } from '../../../config/dynamo-easy-config'
import { initOrUpdateProperty } from '../property/property.decorator'

export function Date(): PropertyDecorator {
  return (target: any, propertyKey: string | symbol) => {
    if (typeof propertyKey === 'string') {
      initOrUpdateProperty({ mapper: DynamoEasyConfig.config.dateMapper }, target, propertyKey)
    }
  }
}
