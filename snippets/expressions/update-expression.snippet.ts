import { DynamoStore, update } from '@shiftcoders/dynamo-easy'
import { Person } from '../models'

const personStore = new DynamoStore(Person)
personStore.update('vogelsw')
  .operations(
    update('name').set('Werner Vogels'),
    update('yearOfBirth').set(1984),
  )
