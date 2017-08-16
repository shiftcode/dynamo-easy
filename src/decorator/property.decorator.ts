import { TypesByConvention, Util } from '../mapper/util'
import { Moment } from '../decorator/moment.type'
import { ScDynamoObjectMapper } from '../sc-dynamo-object-mapper'
import { getMetadataType } from './decorators'
import { PropertyData } from './property-data.model'
import { PropertyMetadata, TypeInfo } from './property-metadata.model'

export const KEY_PROPERTY = 'sc-reflect:property'

export type AttributeModelTypes = String | Number | Boolean | Date | Moment | Set<any> | Array<any>

export function Property(opts: Partial<PropertyData> = {}): PropertyDecorator {
  return function(target: any, propertyKey: string) {
    const propertyOptions: Partial<PropertyMetadata<any>> = {
      name: propertyKey,
      nameDb: opts.name || propertyKey,
    }

    initOrUpdateProperty(propertyOptions, target, propertyKey)
  }
}

export function initOrUpdateProperty(propertyMetadata: Partial<PropertyMetadata<any>> = {}, target: any, propertyKey: string): void {
  // Update the attribute array

  const properties: PropertyMetadata<any>[] = Reflect.getMetadata(KEY_PROPERTY, target.constructor) || []
  let existingProperty: PropertyMetadata<any> = properties.find(property => property.name === propertyKey)

  if (existingProperty) {
    // merge property options
    Object.assign<PropertyMetadata<any>, Partial<PropertyMetadata<any>>>(existingProperty, propertyMetadata)
  } else {
    // add new options
    let newProperty: PropertyMetadata<any> = createNewProperty(propertyMetadata, target, propertyKey)
    properties.push(newProperty)
  }

  Reflect.defineMetadata(KEY_PROPERTY, properties, target.constructor)
}

function createNewProperty(propertyOptions: Partial<PropertyMetadata<any>> = {}, target: any, propertyKey: string): PropertyMetadata<any> {
  let propertyType: AttributeModelTypes = getMetadataType(target, propertyKey)
  let customType = isCustomType(propertyType)

  // FIXME model metadata is not accessible here, need to know the model data for metadatintorspection
  // let modelMetadata: ModelMetadata = Reflect.getMetadata(KEY_MODEL, target.constructor);
  const typeByConvention: TypesByConvention = Util.typeByConvention(propertyKey)
  if (typeByConvention) {
    customType = true

    if (ScDynamoObjectMapper.config) {
      switch (typeByConvention) {
        case 'date':
          switch (ScDynamoObjectMapper.config.dateType) {
            case 'default':
              // FIXME fix typing
              propertyType = <any>Date
              break
            case 'moment':
              propertyType = Moment
              break
            default:
              throw new Error(`Unsupported date type on model metadata <${ScDynamoObjectMapper.config.dateType}>`)
          }
          break
      }
    }
  }

  let propertyDescriptor: PropertyDescriptor = Reflect.getOwnPropertyDescriptor(target, propertyKey)

  const typeInfo: Partial<TypeInfo<any>> = <Partial<TypeInfo<any>>>{
    type: propertyType,
    isCustom: customType,
  }

  console.log(`#### propertyKey: ${propertyKey} / typeInfo: ${JSON.stringify(typeInfo)}`)

  propertyOptions = Object.assign<any, Partial<PropertyMetadata<any>>, Partial<PropertyMetadata<any>>>(
    {},
    {
      name: propertyKey,
      nameDb: propertyKey,
      typeInfo: typeInfo,
    },
    propertyOptions
  )

  return <PropertyMetadata<any>>propertyOptions
}

/**
 * FIXME fix typing
 * FIXME make sure to implement the context dependant details of Binary (Buffer vs. Uint8Array)
 * @returns {boolean} true if the type cannot be mapped by dynamo document client
 */
function isCustomType(type: AttributeModelTypes): boolean {
  return (<any>type) !== String && (<any>type) !== Number && (<any>type) !== Boolean && (<any>type) !== Uint8Array
}
