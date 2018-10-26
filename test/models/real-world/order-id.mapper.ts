import { PropertyMetadata } from '../../../src/decorator'
import { MapperForType } from '../../../src/mapper'
import { StringAttribute } from '../../../src/mapper/type/attribute.type'
import { OrderId } from './order.model'

export class OrderIdMapper implements MapperForType<OrderId, StringAttribute> {
  fromDb(attributeValue: StringAttribute, propertyMetadata?: PropertyMetadata<OrderId>): OrderId {
    return OrderId.fromDb(attributeValue)
  }

  toDb(propertyValue: OrderId, propertyMetadata?: PropertyMetadata<OrderId>): StringAttribute | null {
    return OrderId.toDb(propertyValue)
  }
}
