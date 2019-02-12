import { and, attribute, DynamoStore, not, or } from '@shiftcoders/dynamo-easy'
import { Person } from '../models'

const personStore = new DynamoStore(Person)
personStore.delete('vogelsw')
  .onlyIf(
    or(
      and(
        attribute('myProp').eq('foo'),
        attribute('otherProp').eq('bar')
      ),
      not(
        attribute('otherProp').eq('foo bar')
      ),
    )
  )
