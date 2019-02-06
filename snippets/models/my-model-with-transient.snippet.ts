import { Model, Transient } from '@shiftcoders/dynamo-easy'

@Model()
class MyModel {
  @Transient()
  myPropertyToIgnore: any
}
