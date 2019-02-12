import { DynamoStore } from '@shiftcoders/dynamo-easy'
import * as AWS from 'aws-sdk/global'
import { Person } from './models'

// update the aws config with your credentials to enable successful connection
AWS.config.update({ region: 'yourAwsRegion' })

const personStore = new DynamoStore(Person)

// add a new item
personStore.put({ id: 'wernerv', name: 'Werner Hans Peter Vogels', yearOfBirth: 1958 })
  .exec()
  .then(() => {
    console.log('person stored')
  })

// search for a single person by known id
personStore.query()
  .wherePartitionKey('wernerv')
  .execSingle()
  .then(person => {
    console.log('got person', person)
  })

// returns all persons where the name starts with w
personStore.scan()
  .whereAttribute('name').beginsWith('w')
  .exec()
  .then((persons: Person[]) => {
    console.log('all persons', persons)
  })
