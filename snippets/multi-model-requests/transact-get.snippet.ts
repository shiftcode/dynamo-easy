import { TransactGetRequest } from '@shiftcoders/dynamo-easy'
import { AnotherModel, Person } from '../models'

new TransactGetRequest()
  .returnConsumedCapacity('TOTAL')
  .forModel(Person, { id: 'vogelsw' })
  .forModel(AnotherModel, { propA: 'Foo', propB: 'Bar' })
  .exec()
  .then(result => {
    console.log(result[0]) // Person item
    console.log(result[1]) // AnotherModel item
  })
