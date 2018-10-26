import { PropertyMetadata } from '../../decorator/metadata/property-metadata.model'
import {
  BinaryAttribute,
  BinarySetAttribute,
  BooleanAttribute,
  ListAttribute,
  MapAttribute,
  NullAttribute,
  NumberAttribute,
  NumberSetAttribute,
  StringAttribute,
  StringSetAttribute,
} from '../type/attribute.type'

/**
 * A Mapper is responsible to define how a specific type is mapped to an attribute value which can be stored in dynamodb and how to parse the value from
 * dynamodb back into the specific type
 */
export interface MapperForType<
  T,
  R extends
    | StringAttribute
    | NumberAttribute
    | BinaryAttribute
    | StringSetAttribute
    | NumberSetAttribute
    | BinarySetAttribute
    | MapAttribute
    | ListAttribute
    | NullAttribute
    | BooleanAttribute
> {
  /**
   * Maps an attribute value coming from dynamodb to an javascript type
   */
  fromDb(attributeValue: R, propertyMetadata?: PropertyMetadata<T, R>): T

  /**
   * Maps a js value to an attribute value so it can be stored in dynamodb, supported types are
   *
   * S(tring)
   * N(umber)
   * B(inary)
   * BOOL
   * NULL
   * S(tring)S(et)
   * N(umber)S(et)
   * B(inary)S(et)
   * L(ist)
   */
  toDb(propertyValue: T, propertyMetadata?: PropertyMetadata<T, R>): R | null
}
