import { Attributes } from '../../src/dynamo-easy'
import { Product } from '../models'

export const productFromDb: Attributes<Product> = {
  nestedValue: {
    M: {
      sortedSet: {
        L: [{ S: 'firstValue' }, { S: 'secondValue' }],
      },
    },
  },
}
