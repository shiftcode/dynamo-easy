import { CollectionProperty, Model } from '../../../src/dynamo-easy'
import { BaseForm } from './base-form.model'

@Model({ tableName: 'forms' })
export class Form extends BaseForm {
  @CollectionProperty({ sorted: true })
  types: number[]
}
