// tslint:disable:max-classes-per-file
import { AttributeValue } from 'aws-sdk/clients/dynamodb'
import { PropertyMetadata } from '../../../src/decorator'
import { MapperForType } from '../../../src/mapper'
import { FormId } from './form-id.model'

export class FormIdMapper implements MapperForType<FormId> {
  fromDb(attributeValue: AttributeValue, propertyMetadata?: PropertyMetadata<FormId>): FormId {
    return FormId.parse(attributeValue.S!)
  }

  toDb(propertyValue: FormId, propertyMetadata?: PropertyMetadata<FormId>): AttributeValue | null {
    return { S: FormId.toString(propertyValue) }
  }
}

export class FormIdsMapper implements MapperForType<FormId[] | FormId> {
  fromDb(attributeValue: AttributeValue, propertyMetadata?: PropertyMetadata<FormId[]>): FormId[] | FormId {
    if (attributeValue.L) {
      return attributeValue.L!.map(formIdDb => FormId.parse(formIdDb.S!))
    } else if (attributeValue.S) {
      return FormId.parse(attributeValue.S!)
    } else {
      throw new Error('there is no mappind defined to read attributeValue ' + JSON.stringify(attributeValue))
    }
  }

  toDb(propertyValue: FormId[] | FormId, propertyMetadata?: PropertyMetadata<FormId[]>): AttributeValue | null {
    if (Array.isArray(propertyValue)) {
      return { L: propertyValue.map(a => ({ S: FormId.toString(a) })) }
    } else {
      return { S: FormId.toString(<FormId>propertyValue) }
    }
  }
}
