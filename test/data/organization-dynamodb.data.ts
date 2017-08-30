import { AttributeMap } from 'aws-sdk/clients/dynamodb'
import moment from 'moment-es6'
import { Organization } from '../models/organization.model'

export const organization1CreatedAt: moment.Moment = moment('2017-05-15', 'YYYY-MM-DD')
export const organization1LastUpdated: moment.Moment = moment('2017-07-25', 'YYYY-MM-DD')
export const organization1Employee1CreatedAt: moment.Moment = moment('2015-02-15', 'YYYY-MM-DD')
export const organization1Employee2CreatedAt: moment.Moment = moment('2015-07-03', 'YYYY-MM-DD')

export const organizationFromDb: AttributeMap = <any>{
  id: { S: 'myId' },
  createdAtDate: {
    S: organization1CreatedAt.clone().utc().format(moment.defaultFormat),
  },
  lastUpdated: {
    S: organization1LastUpdated.clone().utc().format(moment.defaultFormat),
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
            S: organization1Employee1CreatedAt.clone().utc().format(moment.defaultFormat),
          },
          sortedSet: { L: [{ S: 'first' }, { S: 'third' }, { S: 'second' }] },
        },
      },
      {
        M: {
          name: { S: 'anna' },
          age: { N: '27' },
          createdAt: {
            S: organization1Employee2CreatedAt.clone().utc().format(moment.defaultFormat),
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
