import { Attributes } from '../../src/dynamo-easy'
import { Organization } from '../models'

export const organization1CreatedAt = new Date('2017-05-15')
export const organization1LastUpdated = new Date('2017-07-25')
export const organization1Employee1CreatedAt = new Date('2015-02-15')
export const organization1Employee2CreatedAt = new Date('2015-07-03')

export const organizationFromDb: Attributes<Organization> = {
  name: { S: 'myOrganization' },
  id: { S: 'myId' },
  transient: { NULL: true },
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
  domains: { SS: ['myOrg.ch', 'myOrg.com'] },
  randomDetails: { L: [{ S: 'detail' }, { N: '5' }] },
  birthdays: {
    L: [
      {
        M: {
          date: { S: new Date('1958-04-13').toISOString() },
          presents: {
            L: [{ M: { description: { S: 'NHL voucher' } } }],
          },
        },
      },
    ],
  },
  awards: {
    L: [{ S: 'Best of Swiss Web' }],
  },
  events: {
    L: [
      {
        M: {
          name: { S: 'yearly get together' },
          participants: { N: '125' },
        },
      },
    ],
  },
  emptySet: { SS: [] },
}
