import moment from 'moment'
import { AttributeMap } from '../../attribute-map.type'
import { Product } from '../models/product.model'

export const organization1CreatedAt: moment.Moment = moment('2017-05-15', 'YYYY-MM-DD')
export const organization1LastUpdated: moment.Moment = moment('2017-07-25', 'YYYY-MM-DD')
export const organization1Employee1CreatedAt: moment.Moment = moment('2015-02-15', 'YYYY-MM-DD')
export const organization1Employee2CreatedAt: moment.Moment = moment('2015-07-03', 'YYYY-MM-DD')

export const productFromDb: AttributeMap<Product> = <any>{
  nestedValue: {
    M: {
      sortedSet: {
        L: [{ S: 'firstValue' }, { S: 'secondValue' }],
      },
    },
  },
}
