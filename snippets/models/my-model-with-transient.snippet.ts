import { Model, Transient } from '@shiftcoders/dynamo-easy'

@Model( {tableName: 'my-models'} )
class MyModel {
  @Transient()
  myPropertyToIgnore: any
}
