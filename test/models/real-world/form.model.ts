import { SortedSet } from '../../../src/decorator/impl/collection/sorted-set.decorator'
import { Model } from '../../../src/decorator/impl/model/model.decorator'
import { BaseForm } from './base-form.model'

@Model({ tableName: 'forms' })
export class Form extends BaseForm {
  @SortedSet()
  types: number[]
}
