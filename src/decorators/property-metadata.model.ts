import moment from "moment"
import { PropertyType } from "./property-type.type"
import { AttributeModelTypeName } from "../mapper/attribute-model-type.type"

export interface PropertyMetadata {
  // key of the property on js side
  key: string
  // name of the dynamodb attribute, same as key by default
  name?: string

  /*
   * the type will re resolved using compile time information leveraging the reflect api, due to some limitations we
   * cannot differ between Object, Set, Map so we need an additional @Type decorator
   */
  type?: PropertyType
  typeName?: AttributeModelTypeName
  // typeName?: PropertyTypeName;
  // FIXME review concept
  customType?: boolean // true if we use a non native type for dynamo document client
  partitionKey?: boolean
  sortKey?: boolean
  // index?: IModelAttributeIndex
  transient?: boolean
}
