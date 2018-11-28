import { Model, SortedSet } from '../../../src/dynamo-easy'
import { BaseForm } from './base-form.model'

@Model({ tableName: 'forms' })
export class Form extends BaseForm {
  @SortedSet()
  types: number[]
}
