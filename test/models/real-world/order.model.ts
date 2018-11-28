// tslint:disable:max-classes-per-file

import {
  CustomMapper,
  DateProperty,
  GSIPartitionKey,
  GSISortKey,
  Model,
  PartitionKey,
} from '../../../src/dynamo-easy'
import { FormId, FormIdsMapper } from './form-id.model'
import { FormType } from './form-type.enum'
import { OrderId, OrderIdMapper } from './order-id.model'

@Model()
export class BaseOrder {
  @PartitionKey()
  @CustomMapper(OrderIdMapper)
  id: OrderId

  @GSIPartitionKey('order_product_id_creation_date')
  productId: string

  @GSISortKey('order_product_id_creation_date')
  @DateProperty()
  creationDate: Date

  @CustomMapper(FormIdsMapper)
  formIds: FormId[]

  // FIXME DE check if persisted
  // internal use for UI only, should not be persisted
  isNew?: boolean
}

@Model()
export class Order extends BaseOrder {
  // should map to number enum
  types: FormType[]

  displayOrderCustomerIdentNr: string

  orderCustomerIdentNr: string // lowercase for search
}
