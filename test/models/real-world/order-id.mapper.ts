import { AttributeValue } from 'aws-sdk/clients/dynamodb'
import { PropertyMetadata } from '../../../src/decorator'
import { MapperForType } from '../../../src/mapper'
import { OrderId } from './order.model'

export class OrderIdMapper implements MapperForType<OrderId> {
  fromDb(attributeValue: AttributeValue, propertyMetadata?: PropertyMetadata<OrderId>): OrderId {
    return OrderId.fromDb(attributeValue)
  }

  toDb(propertyValue: OrderId, propertyMetadata?: PropertyMetadata<OrderId>): AttributeValue | null {
    return OrderId.toDb(propertyValue)
  }
}
