import { DynamoStore } from '@shiftcoders/dynamo-easy'
import { Person } from '../models'

new DynamoStore(Person)
  .scan()
  .whereAttribute('yearOfBirth').equals(1958)
  .execFetchAll()
  .then(res => console.log('ALL items with yearOfBirth == 1958', res))
