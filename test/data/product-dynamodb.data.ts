import { Attributes } from '../../src/dynamo-easy'

export const productFromDb: Attributes = <any>{
  nestedValue: {
    M: {
      sortedSet: {
        L: [{ S: 'firstValue' }, { S: 'secondValue' }],
      },
    },
  },
}
