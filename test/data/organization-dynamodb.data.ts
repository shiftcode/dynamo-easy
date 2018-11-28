import { Attributes } from '../../src/dynamo-easy'

export const organization1CreatedAt = new Date('2017-05-15')
export const organization1LastUpdated = new Date('2017-07-25')
export const organization1Employee1CreatedAt = new Date('2015-02-15')
export const organization1Employee2CreatedAt = new Date('2015-07-03')

export const organizationFromDb: Attributes = <any>{
  id: { S: 'myId' },
  createdAtDate: {
    S: organization1CreatedAt.toISOString(),
  },
  lastUpdated: {
    S: organization1LastUpdated.toISOString(),
  },
  active: { BOOL: true },
  count: { N: '52' },
  employees: {
    L: [
      {
        M: {
          name: { S: 'max' },
          age: { N: '50' },
          createdAt: {
            S: organization1Employee1CreatedAt.toISOString(),
          },
          sortedSet: { L: [{ S: 'first' }, { S: 'third' }, { S: 'second' }] },
        },
      },
      {
        M: {
          name: { S: 'anna' },
          age: { N: '27' },
          createdAt: {
            S: organization1Employee2CreatedAt.toISOString(),
          },
          sortedSet: { L: [{ S: 'first' }, { S: 'third' }, { S: 'second' }] },
        },
      },
    ],
  },
  cities: { SS: ['zürich', 'bern'] },
  awardWinningYears: { NS: ['2002', '2015', '2017'] },
  mixedList: { L: [{ S: 'sample' }, { N: '26' }, { BOOL: true }] },
  sortedSet: { L: [{ S: '1' }, { S: '2' }] },
}
