/**
 * @module mapper
 */
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
 * Maps a js value to an attribute value so it can be stored in dynamoDB, supported types are
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
export type ToDbFn<
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
> = (propertyValue: T, propertyMetadata?: PropertyMetadata<T, R>) => R | null

/**
 * Maps an attribute value coming from dynamoDB to an javascript type
 */
export type FromDbFn<
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
> = (attributeValue: R, propertyMetadata?: PropertyMetadata<T, R>) => T

/**
 * A Mapper is responsible to define how a specific type is mapped to an attribute value which can be stored in dynamoDB and how to parse the value from
 * dynamoDB back into the specific type
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
  fromDb: FromDbFn<T, R>
  toDb: ToDbFn<T, R>
}
