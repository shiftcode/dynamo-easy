import { AttributeModelTypeName } from "../mapper/attribute-model-type.type"
import { Mapper } from "../mapper/mapper"
import { Util } from "../mapper/util"
import { ScDynamoObjectMapper } from "../sc-dynamo-object-mapper"
import { getMetadataType } from "./decorators"
import { PropertyData } from "./property-data.model"
import { PropertyMetadata } from "./property-metadata.model"

export const KEY_PROPERTY = "sc-reflect:property"

export type AttributeModelTypes =
  | String
  | Number
  | Boolean
  | Date
  | "moment"
  | Set<any>
  | Array<any>

export function Property(opts: Partial<PropertyData> = {}): PropertyDecorator {
  return function(target: any, propertyKey: string) {
    const propertyOptions: Partial<PropertyMetadata> = {
      key: propertyKey,
      name: opts.name || propertyKey
    }

    initOrUpdateProperty(propertyOptions, target, propertyKey)
  }
}

export function initOrUpdateProperty(
  propertyMetadata: Partial<PropertyMetadata> = {},
  target: any,
  propertyKey: string
): void {
  // Update the attribute array

  const properties: PropertyMetadata[] =
    Reflect.getMetadata(KEY_PROPERTY, target.constructor) || []
  let existingProperty: PropertyMetadata = properties.find(
    property => property.key === propertyKey
  )

  if (existingProperty) {
    // merge property options
    Object.assign<PropertyMetadata, Partial<PropertyMetadata>>(
      existingProperty,
      propertyMetadata
    )
  } else {
    // add new options
    let newProperty: PropertyMetadata = createNewProperty(
      propertyMetadata,
      target,
      propertyKey
    )
    properties.push(newProperty)
  }

  Reflect.defineMetadata(KEY_PROPERTY, properties, target.constructor)
}

function createNewProperty(
  propertyOptions: Partial<PropertyMetadata> = {},
  target: any,
  propertyKey: string
): PropertyMetadata {
  // TODO fix typing no mix between string and type
  let propertyType: AttributeModelTypes = getMetadataType(target, propertyKey)

  let propertyTypeName: AttributeModelTypeName
  if (propertyType.hasOwnProperty("name")) {
    propertyTypeName = (<any>propertyType).name
  } else {
    propertyTypeName = Util.typeOf(propertyType)
  }

  let customType = isCustomType(propertyType)

  // FIXME model metadata is not accessible here, need to know the model data for metadatintorspection
  // let modelMetadata: ModelMetadata = Reflect.getMetadata(KEY_MODEL, target.constructor);
  if (Mapper.REGEX_DATE_PROPERTY.test(propertyKey)) {
    customType = true

    if (ScDynamoObjectMapper.config) {
      switch (ScDynamoObjectMapper.config.dateType) {
        case "default":
          // FIXME fix typing
          propertyType = <any>Date
          propertyTypeName = "Date"
          break
        case "moment":
          propertyType = "moment"
          propertyTypeName = "Moment"
          break
        default:
          throw new Error(
            `Unsupported date type on model metadata <${ScDynamoObjectMapper
              .config.dateType}>`
          )
      }
    }
  }
  console.log(
    `#### propertyKey: ${propertyKey} / propertyType: ${propertyType} / propertyTypeName: ${propertyTypeName}`
  )

  let propertyDescriptor: PropertyDescriptor = Reflect.getOwnPropertyDescriptor(
    target,
    propertyKey
  )
  propertyOptions = Object.assign<
    any,
    Partial<PropertyMetadata>,
    Partial<PropertyMetadata>
  >(
    {},
    {
      key: propertyKey,
      name: propertyKey,
      type: propertyType,
      typeName: propertyTypeName,
      customType: customType
    },
    propertyOptions
  )

  return <PropertyMetadata>propertyOptions
}

/**
 * FIXME fix typing
 * FIXME make sure to implement the context dependant details of Binary (Buffer vs. Uint8Array)
 * @returns {boolean} true if the type cannot be mapped by dynamo document client
 */
function isCustomType(type: AttributeModelTypes): boolean {
  return (
    (<any>type) !== String &&
    (<any>type) !== Number &&
    (<any>type) !== Boolean &&
    (<any>type) !== Uint8Array
  )
}
