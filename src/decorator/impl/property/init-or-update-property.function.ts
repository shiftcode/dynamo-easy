/**
 * @module decorators
 */
import { Attribute } from '../../../mapper/type/attribute.type'
import { ModelConstructor } from '../../../model/model-constructor'
import { PropertyMetadata, TypeInfo } from '../../metadata/property-metadata.model'
import { getMetadataType } from '../../util'
import { KEY_PROPERTY } from './key-property.const'

/**
 * @hidden
 */
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

/**
 * @hidden
 */
function createNewProperty(
  propertyOptions: Partial<PropertyMetadata<any, Attribute>> = {},
  target: any,
  propertyKey: string,
): PropertyMetadata<any> {
  const propertyType: ModelConstructor<any> = getMetadataType(target, propertyKey)

  if (propertyType === undefined) {
    throw new Error(
      'make sure you have enabled the typescript compiler options which enable us to work with decorators (see doc)',
    )
  }

  const typeInfo: TypeInfo = { type: propertyType }

  propertyOptions = {
    name: propertyKey,
    nameDb: propertyKey,
    typeInfo,
    ...propertyOptions,
  }

  return <PropertyMetadata<any>>propertyOptions
}
