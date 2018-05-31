import { Model } from '../../../src/decorator/impl/model/model.decorator'
import { Form } from './form.model'

@Model({ tableName: 'forms' })
export class ExtendedFormModel extends Form {
  myOtherProperty: string
}
