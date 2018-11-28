import { AttributeValueType } from '../../../mapper/type/attribute-value-type.type'
import { Attribute } from '../../../mapper/type/attribute.type'
import { ModelConstructor } from '../../../model/model-constructor'
import { PropertyMetadata, TypeInfo } from '../../metadata/property-metadata.model'
import { getMetadataType } from '../../util'
import { KEY_PROPERTY } from './key-property.const'

export function initOrUpdateProperty(
  propertyMetadata: Partial<PropertyMetadata<any, Attribute>> = {},
  target: any,
  propertyKey: string,
): void {
  // the new or updated property
  let property: PropertyMetadata<any>

  // Update the attribute array
  let properties: Array<PropertyMetadata<any>> = Reflect.getMetadata(KEY_PROPERTY, target.constructor) || []
  const existingProperty = properties.find(p => p.name === propertyKey)
  if (existingProperty) {
    // create new property with merged options
    property = { ...existingProperty, ...propertyMetadata }
    // remove existing from array
    properties = properties.filter(p => p !== existingProperty)
  } else {
    // add new options
    property = createNewProperty(propertyMetadata, target, propertyKey)
  }

  Reflect.defineMetadata(KEY_PROPERTY, [...properties, property], target.constructor)
}

function createNewProperty(
  propertyOptions: Partial<PropertyMetadata<any, Attribute>> = {},
  target: any,
  propertyKey: string,
): PropertyMetadata<any> {
  const propertyType: ModelConstructor<any> = getMetadataType(target, propertyKey)
  const isCustom = isCustomType(propertyType)

  const typeInfo: TypeInfo = {
    type: propertyType,
    isCustom,
  }

  propertyOptions = {
    name: propertyKey,
    nameDb: propertyKey,
    typeInfo,
    // ...mapperOpts,
    ...propertyOptions,
  }

  return <PropertyMetadata<any>>propertyOptions
}

/**
 * TODO LOW:BINARY make sure to implement the context dependant details of Binary (Buffer vs. Uint8Array)
 * @returns {boolean} true if the type cannot be mapped by dynamo document client
 */
function isCustomType(type: AttributeValueType): boolean {
  return <any>type !== String && <any>type !== Number && <any>type !== Boolean && <any>type !== Uint8Array
}
