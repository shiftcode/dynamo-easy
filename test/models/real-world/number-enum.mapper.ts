import { AttributeValue } from 'aws-sdk/clients/dynamodb'
import { PropertyMetadata } from '../../../src/decorator'
import { MapperForType } from '../../../src/mapper'

export class NumberEnumMapper implements MapperForType<any> {
  fromDb(attributeValue: AttributeValue, propertyMetadata?: PropertyMetadata<any>): any[] {
    return <any[]>attributeValue.NS!.map(numberEnumValue => parseInt(numberEnumValue, 10))
  }

  toDb(propertyValues: any[], propertyMetadata?: PropertyMetadata<any>): AttributeValue | null {
    return { NS: propertyValues.map(propertyValue => propertyValue.toString()) }
  }
}
