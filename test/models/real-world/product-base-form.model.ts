import { SortKey } from '../../../src/decorator/impl/key/sort-key.decorator'
import { Model } from '../../../src/decorator/impl/model/model.decorator'
import { BaseForm } from './base-form.model'

@Model({ tableName: 'forms' })
export class ProductBaseFormModel extends BaseForm {
  @SortKey() productId: string
}
