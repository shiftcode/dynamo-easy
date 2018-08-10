// tslint:disable:max-classes-per-file
import { AttributeValue } from 'aws-sdk/clients/dynamodb'
import moment from 'moment-es6'
import { GSIPartitionKey } from '../../../src/decorator/impl/index/gsi-partition-key.decorator'
import { GSISortKey } from '../../../src/decorator/impl/index/gsi-sort-key.decorator'
import { PartitionKey } from '../../../src/decorator/impl/key/partition-key.decorator'
import { CustomMapper } from '../../../src/decorator/impl/mapper/custom-mapper.decorator'
import { Model } from '../../../src/decorator/impl/model/model.decorator'
import { FormIdsMapper } from './form-id.mapper'
import { FormId } from './form-id.model'
import { NumberEnumMapper } from './number-enum.mapper'
import { OrderIdMapper } from './order-id.mapper'

/*
 * these types are used to generate forms linked to a product:
 * - request
 * - quote
 *
 * frame-order is another container where all the frame-order forms are linked to
 * - frame-order
 *
 * and these to link to an order:
 * - order
 * - confirmation
 * - delivery
 * - invoice
 * - warning
 * - credit
 * - debit
 * - cover
 * - palette info
 */

// NOTE we persist the index of formType, so NEVER change the index and always add one with new types
export enum FormType {
  REQUEST = 0,
  QUOTE = 1,
  ORDER = 2,
  CONFIRMATION = 3,
  DELIVERY = 4,
  INVOICE = 5,
  CREDIT = 6,
  DEBIT = 7,
  FAILURE_RETURN = 8,
  COVER = 9,
  PALETTE_INFO = 10,
  FRAME_ORDER = 11,
  WARNING = 12,
  INVOICE_GMBH = 13,
  STOCK_ORDER = 14,
  STOCK_COVER = 15,
}

export class OrderId {
  counter: number
  year: number

  static parse(orderId?: string): OrderId {
    if (orderId) {
      const counter: number = parseInt(orderId.slice(0, 4).replace('0', ''), 10)
      const year: number = parseInt(orderId.slice(4), 10)

      return new OrderId(counter, year)
    } else {
      throw new Error('orderId must be provided as string, got no value')
    }
  }

  static toString(formId: OrderId): string {
    // use the join method with array length to produce leading zeroes
    const leadingZeroes: string = new Array(4 + 1 - (formId.counter + '').length).join('0')
    return leadingZeroes + formId.counter + formId.year
  }

  static toDb(modelValue: OrderId): AttributeValue {
    return { S: modelValue.toString() }
  }

  static fromDb(dbValue: AttributeValue): OrderId {
    return OrderId.parse(dbValue['S'])
  }

  constructor(counter: number, year: number) {
    this.counter = counter
    this.year = year
  }

  toString(): string {
    return OrderId.toString(this)
  }

  clone(): OrderId {
    return new OrderId(this.counter, this.year)
  }
}

@Model()
export class BaseOrder {
  @PartitionKey()
  @CustomMapper(OrderIdMapper)
  id: OrderId

  @GSIPartitionKey('order_product_id_creation_date')
  productId: string

  @GSISortKey('order_product_id_creation_date')
  creationDate: moment.Moment

  @CustomMapper(FormIdsMapper)
  formIds: FormId[]

  // FIXME DE check if persisted
  // internal use for UI only, should not be persisted
  _isNew?: boolean
}

@Model()
export class Order extends BaseOrder {
  @CustomMapper(NumberEnumMapper)
  types: FormType[]
  displayOrderCustomerIdentNr: string
  orderCustomerIdentNr: string // lowercase for search
  @CustomMapper(FormIdsMapper)
  formIds: FormId[]
}
