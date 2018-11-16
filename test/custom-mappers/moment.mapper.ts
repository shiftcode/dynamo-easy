import * as moment from 'moment'
import { MapperForType } from '../../src/mapper/for-type/base.mapper'
import { StringAttribute } from '../../src/mapper/type/attribute.type'

export class MomentMapper implements MapperForType<moment.Moment, StringAttribute> {
  fromDb(value: StringAttribute): moment.Moment {
    const parsed: moment.Moment = moment(value.S, moment.ISO_8601)
    if (!parsed.isValid()) {
      throw new Error(`the value ${value} cannot be parsed into a valid moment date`)
    }
    return parsed
  }

  toDb(value: moment.Moment): StringAttribute {
    if (moment.isMoment(value)) {
      if (value.isValid()) {
        // always store in utc, default format is ISO_8601
        return {
          S: value
            .clone()
            .utc()
            .format(),
        }
      } else {
        throw new Error(`cannot map property value ${value}, because it is not a valid moment date`)
      }
    } else {
      throw new Error(`the value ${value} is not of type moment`)
    }
  }
}
