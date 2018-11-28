import { Model, SortKey } from '../../../src/dynamo-easy'
import { BaseForm } from './base-form.model'

@Model({ tableName: 'forms' })
export class ProductBaseFormModel extends BaseForm {
  @SortKey()
  productId: string
}
