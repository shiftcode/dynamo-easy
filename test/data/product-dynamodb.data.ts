import { Attributes } from '../../src/mapper/type/attribute.type'
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
