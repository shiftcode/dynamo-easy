import { ModelClass } from "../model/model"
import { initOrUpdateProperty } from "./property.decorator"
import { ScDynamoObjectMapper } from "../sc-dynamo-object-mapper"
import { Util } from "../mapper/util"
import { AttributeModelTypeName } from "../mapper/attribute-model-type.type"

export type CustomTypes = Set<number | string | boolean> | DateConstructor

export function Type(
  typeClass: ModelClass<CustomTypes> | "moment"
): PropertyDecorator {
  return function(target: Object, propertyKey: string) {
    if (ScDynamoObjectMapper.config && ScDynamoObjectMapper.config.dateType) {
      if (
        (ScDynamoObjectMapper.config.dateType === "default" &&
          typeClass === "moment") ||
        (ScDynamoObjectMapper.config.dateType === "moment" &&
          (<any>typeClass) === Date)
      ) {
        throw new Error(`the dateType can only be defined globally using the ScDynamoObjectMapper.config.dateType configuration, ' +
        'given type <${typeClass}> mismatches the global config <${ScDynamoObjectMapper
          .config.dateType}>`)
      }
    }

    const typeName: AttributeModelTypeName =
      typeClass === "moment"
        ? "Moment"
        : typeClass.hasOwnProperty("name") ? (<any>typeClass).name : "unkown"

    // initOrUpdateProperty({ typeName: <PropertyTypeName>clazzName, type: typeClass, customType: true }, target, propertyKey);
    initOrUpdateProperty(
      { type: typeClass, typeName: typeName, customType: true },
      target,
      propertyKey
    )
  }
}
