import { Util } from '../mapper/util'
import { ScDynamoObjectMapper } from '../sc-dynamo-object-mapper'
import { BlaType } from './bla.type'
import { TypeInfo } from './property-metadata.model'
import { initOrUpdateProperty } from './property.decorator'

export function Date(): PropertyDecorator {
  return (target: any, propertyKey: string) => {
    // check the global config to decide which dat type we should use
    let dateType
    switch (ScDynamoObjectMapper.config.dateType) {
      case 'default':
        dateType = Date
        break
      case 'moment':
        dateType = BlaType
        break
    }

    const typeInfo: Partial<TypeInfo> = <Partial<TypeInfo>>{
      type: dateType,
      typeName: Util.typeName(dateType),
      isCustom: true,
    }

    initOrUpdateProperty({ typeInfo }, target, propertyKey)
  }
}
