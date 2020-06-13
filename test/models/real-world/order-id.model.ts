import { MapperForType, StringAttribute } from '../../../src/dynamo-easy'

export class OrderId {
  counter: number
  year: number

  constructor(counter: number, year: number) {
    this.counter = counter
    this.year = year
  }

  static parse(orderId?: string): OrderId {
    if (orderId) {
      const counter: number = parseInt(orderId.slice(0, 4).replace('0', ''), 10)
      const year: number = parseInt(orderId.slice(4), 10)

      return new OrderId(counter, year)
    } else {
      throw new Error('orderId must be provided as string, got no value')
    }
  }

  static unparse(formId: OrderId): string {
    // use the join method with array length to produce leading zeroes
    const leadingZeroes: string = new Array(4 + 1 - (formId.counter + '').length).join('0')
    return leadingZeroes + formId.counter + formId.year
  }
}

export const orderIdMapper: MapperForType<OrderId, StringAttribute> = {
  fromDb: (attributeValue: StringAttribute) => OrderId.parse(attributeValue.S),
  toDb: (propertyValue: OrderId) => ({ S: OrderId.unparse(propertyValue) }),
}
