import { DynamoStore } from '@shiftcoders/dynamo-easy'
import { Person } from '../models'

new DynamoStore(Person)
  .batchWrite()
  .delete([{ id: 'a' }, { id: 'b' }])
  .put([{ id: 'vogelsw', name: 'Werner Hans Peter Vogels', yearOfBirth: 1958 }])
  .exec()
  .then(() => console.log('item a, b deleted; werner vogels added'))
