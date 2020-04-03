/**
 * @module mapper
 */
import { notNull } from '../helper/not-null.function'
import { MapperForType } from './for-type/base.mapper'
import {
  BinaryAttribute,
  BinarySetAttribute,
  ListAttribute,
  NumberAttribute,
  NumberSetAttribute,
  StringAttribute,
  StringSetAttribute,
} from './type/attribute.type'
import { isSet } from './util'

/**
 * @hidden
 */
export type SetAttributeOf<A extends StringAttribute | NumberAttribute | BinaryAttribute> = A extends StringAttribute
  ? StringSetAttribute
  : A extends NumberAttribute
  ? NumberSetAttribute
  : BinarySetAttribute

/**
 * @hidden
 */
export function arrayToListAttribute<T, A extends StringAttribute | NumberAttribute | BinaryAttribute>(
  customMapper: MapperForType<T, A>,
) {
  return (values: T[]): ListAttribute<A> | null => {
    const mapped = values.map((v) => customMapper.toDb(v)).filter(notNull)
    return <ListAttribute<A>>{ L: mapped }
  }
}

/**
 * @hidden
 */
export function listAttributeToArray<T, A extends StringAttribute | NumberAttribute | BinaryAttribute>(
  customMapper: MapperForType<T, A>,
) {
  return (attributeValues: ListAttribute<A>): T[] => attributeValues.L.map((i) => customMapper.fromDb(i))
}

/**
 * @hidden
 */
export function setAttributeToArray<T, A extends StringAttribute | NumberAttribute | BinaryAttribute>(
  customMapper: MapperForType<T, A>,
) {
  return (attributeValues: SetAttributeOf<A>): T[] => {
    switch (Object.keys(attributeValues)[0]) {
      case 'SS':
        return (<StringSetAttribute>attributeValues).SS.map((v) => customMapper.fromDb(<A>{ S: v }))
      case 'NS':
        return (<NumberSetAttribute>attributeValues).NS.map((v) => customMapper.fromDb(<A>{ N: v }))
      case 'BS':
        return (<BinarySetAttribute>attributeValues).BS.map((v) => customMapper.fromDb(<A>{ B: v }))
      default:
        throw new Error(`given attribute (${JSON.stringify(attributeValues)}) value is not a SetAttribute`)
    }
  }
}

/**
 * @hidden
 */
export function arrayToSetAttribute<T, A extends StringAttribute | NumberAttribute | BinaryAttribute>(
  customMapper: MapperForType<T, A>,
) {
  return (values: T[]): SetAttributeOf<A> | null => {
    const mapped = values.map((v) => customMapper.toDb(v)).filter(notNull)
    if (mapped.length === 0) {
      return null
    }
    switch (Object.keys(mapped[0])[0]) {
      case 'S':
        return <SetAttributeOf<A>>{ SS: (<StringAttribute[]>mapped).map((sa) => sa.S) }
      case 'N':
        return <SetAttributeOf<A>>{ NS: (<NumberAttribute[]>mapped).map((na) => na.N) }
      case 'B':
        return <SetAttributeOf<A>>{ BS: (<BinaryAttribute[]>mapped).map((ba) => ba.B) }
      default:
        throw new Error('values given are not of type string, number or binary after applying the custom mapper')
    }
  }
}

/**
 * returns a function which takes a Set which will be spread when applied to the given function
 *
 * @hidden
 */
function spreadSetAndApplyToFn<T, R>(fn: (values: T[]) => R) {
  return (values: Set<T>) => {
    if (!isSet(values)) {
      throw new Error(`provided argument (${JSON.stringify(values)}) is neither a Set nor an Array`)
    }
    return fn([...values])
  }
}

/**
 * returns a function which will execute the given function and wraps its return value in a Set
 *
 * @hidden
 */
function applyFnWrapWithSet<A, R>(fn: (arg: A) => R[]) {
  return (arg: A) => new Set(fn(arg))
}

/**
 * @hidden
 */
export function wrapMapperForDynamoSetJsArray<T, A extends StringAttribute | NumberAttribute | BinaryAttribute>(
  customMapper: MapperForType<T, A>,
): MapperForType<T[], SetAttributeOf<A>> {
  return {
    fromDb: setAttributeToArray(customMapper),
    toDb: arrayToSetAttribute(customMapper),
  }
}

/**
 * @hidden
 */
export function wrapMapperForDynamoSetJsSet<T, A extends StringAttribute | NumberAttribute | BinaryAttribute>(
  customMapper: MapperForType<T, A>,
): MapperForType<Set<T>, SetAttributeOf<A>> {
  return {
    fromDb: applyFnWrapWithSet(setAttributeToArray(customMapper)),
    toDb: spreadSetAndApplyToFn(arrayToSetAttribute(customMapper)),
  }
}

/**
 * @hidden
 */
export function wrapMapperForDynamoListJsArray<T, A extends StringAttribute | NumberAttribute | BinaryAttribute>(
  customMapper: MapperForType<T, A>,
): MapperForType<T[], ListAttribute<A>> {
  return {
    fromDb: listAttributeToArray(customMapper),
    toDb: arrayToListAttribute(customMapper),
  }
}

/**
 * @hidden
 */
export function wrapMapperForDynamoListJsSet<T, A extends StringAttribute | NumberAttribute | BinaryAttribute>(
  customMapper: MapperForType<T, A>,
): MapperForType<Set<T>, ListAttribute<A>> {
  return {
    fromDb: applyFnWrapWithSet(listAttributeToArray(customMapper)),
    toDb: spreadSetAndApplyToFn(arrayToListAttribute(customMapper)),
  }
}
