// tslint:disable:max-classes-per-file

import { CollectionProperty } from '../../../src/decorator/impl/collection/collection-property.decorator'
import {
  DateProperty,
  GSIPartitionKey,
  GSISortKey,
  Model,
  PartitionKey,
  Property,
  Transient,
} from '../../../src/dynamo-easy'
import { FormId, formIdMapper } from './form-id.model'
import { FormType } from './form-type.enum'
import { OrderId, orderIdMapper } from './order-id.model'

@Model()
export class BaseOrder {
  @PartitionKey()
  @Property({ mapper: orderIdMapper })
  id: OrderId

  @GSIPartitionKey('order_product_id_creation_date')
  productId: string

  @GSISortKey('order_product_id_creation_date')
  @DateProperty()
  creationDate: Date

  @CollectionProperty({ sorted: true, itemMapper: formIdMapper }) // mapped to list, since sorted
  formIds: FormId[]

  // internal use for UI only, should not be persisted
  @Transient()
  isNew?: boolean
}

@Model()
export class Order extends BaseOrder {
  // should map to number enum
  types: FormType[]

  displayOrderCustomerIdentNr: string

  orderCustomerIdentNr: string // lowercase for search
}
