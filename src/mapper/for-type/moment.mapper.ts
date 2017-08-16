import { AttributeValue } from 'aws-sdk/clients/dynamodb'
import moment from 'moment'
import { MapperForType } from './base.mapper'

export class MomentMapper implements MapperForType<moment.Moment> {
  fromDb(value: AttributeValue): moment.Moment {
    let parsed: moment.Moment = moment(value.S, moment.ISO_8601)
    if (!parsed.isValid()) {
      throw new Error(`the value ${value} cannot be parsed into a valid moment date`)
    }

    return parsed
  }

  toDb(value: moment.Moment): AttributeValue {
    if (moment.isMoment(value)) {
      if (value.isValid()) {
        // always store in utc, default format is ISO_8601
        return { S: value.clone().utc().format() }
      } else {
        throw new Error(`cannot map property value ${value}, because it is not a valid moment date`)
      }
    } else {
      throw new Error(`the value ${value} is not of type moment`)
    }
  }
}
