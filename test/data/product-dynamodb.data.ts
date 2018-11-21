import { Attributes } from '../../src/mapper/type/attribute.type'

export const productFromDb: Attributes = <any>{
  nestedValue: {
    M: {
      sortedSet: {
        L: [{ S: 'firstValue' }, { S: 'secondValue' }],
      },
    },
  },
}
