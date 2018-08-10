import { DynamoEasyConfig } from '../../../config/dynamo-easy-config'
import { MomentType } from '../../../mapper/type/moment.type'
import { TypeInfo } from '../../metadata/property-metadata.model'
import { initOrUpdateProperty } from '../property/property.decorator'

export function Date(): PropertyDecorator {
  return (target: any, propertyKey: string | symbol) => {
    if (typeof propertyKey === 'string') {
      // check the global config to decide which dat type we should use
      let dateType
      switch (DynamoEasyConfig.config.dateType) {
        case 'default':
          dateType = Date
          break
        case 'moment':
          dateType = MomentType
          break
      }

      const typeInfo: Partial<TypeInfo> = <Partial<TypeInfo>>{
        type: dateType,
        isCustom: true,
      }

      initOrUpdateProperty({ typeInfo }, target, propertyKey)
    }
  }
}
