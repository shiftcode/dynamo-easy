import { DynamoStore } from '@shiftcoders/dynamo-easy'
import { Person } from '../models'

new DynamoStore(Person)
  .batchGet([{ id: 'a' }, { id: 'b' }])
  .exec()
  .then(res => console.log('fetched items:', res))
