import { DynamoStore } from '@shiftcoders/dynamo-easy'
import { Person } from '../models'

new DynamoStore(Person)
  .delete('vogelsw')
  .onlyIfAttribute('yearOfBirth').lte(1958)
  .exec()
  .then(() => console.log('done'))
