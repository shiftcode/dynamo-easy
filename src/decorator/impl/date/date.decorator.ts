import { dynamoEasyConfig } from '../../../config/dynamo-easy-config'
import { initOrUpdateProperty } from '../property/init-or-update-property.function'

export function Date(): PropertyDecorator {
  return (target: any, propertyKey: string | symbol) => {
    if (typeof propertyKey === 'string') {
      initOrUpdateProperty({ mapper: () => dynamoEasyConfig.dateMapper }, target, propertyKey)
    }
  }
}
