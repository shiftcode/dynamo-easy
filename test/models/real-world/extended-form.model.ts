import { Model, Property } from '../../../src/dynamo-easy'
import { Form } from './form.model'

@Model({ tableName: 'forms' })
export class ExtendedFormModel extends Form {
  @Property()
  myOtherProperty: string
}
