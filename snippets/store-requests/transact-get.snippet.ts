import { DynamoStore } from '@shiftcoders/dynamo-easy'
import { Person } from '../models'

new DynamoStore(Person)
  .transactGet([{ id: 'a' }, { id: 'b' }])
  .exec()
  .then(() => console.log('transactionally read a and b'))
