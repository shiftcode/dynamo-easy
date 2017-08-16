import { TypeInfo } from './property-metadata.model'
import { Moment } from '../decorator/moment.type'
import { initOrUpdateProperty } from './property.decorator'
import { ScDynamoObjectMapper } from '../sc-dynamo-object-mapper'
import { Util } from '../mapper/util'

export function Date(): PropertyDecorator {
  return function(target: any, propertyKey: string) {
    // check the global config to decide which dat type we should use
    let dateType
    switch (ScDynamoObjectMapper.config.dateType) {
      case 'default':
        dateType = Date
        break
      case 'moment':
        dateType = Moment
        break
    }

    const typeInfo: Partial<TypeInfo<Moment | Date>> = <Partial<TypeInfo<Moment | Date>>>{
      type: dateType,
      typeName: Util.typeName(dateType),
      isCustom: true,
    }

    initOrUpdateProperty({ typeInfo: typeInfo }, target, propertyKey)
  }
}
