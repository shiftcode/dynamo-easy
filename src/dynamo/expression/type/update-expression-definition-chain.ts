/**
 * @module expression
 */
import { ExtractListType } from '../../../helper/extract-list-type.type'
import { ConditionalParamsHost } from '../../operation-params.type'
import { UpdateExpressionDefinitionFunction } from './update-expression-definition-function'

/**
 * see http://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.UpdateExpressions.html for full documentation
 *
 */
export interface UpdateFunctions<T, R> {
  /* ----------------------------------------------------------------
      SET operations
   ---------------------------------------------------------------- */
  /**
   * only works for numbers. So it either is a number or maps to a NumberAttribute (with custom mapper)
   * @param value which maps to NumberAttribute
   */
  incrementBy: (value: T) => R

  /**
   * only works for numbers. So it either is a number or maps to a NumberAttribute (with custom mapper)
   * @param value which maps to NumberAttribute
   */
  decrementBy: (value: T) => R

  /**
   * will update the item at the path, path can be a top level attribute or a nested attribute.
   * samples:
   * - persons.age
   * - places[0].address.street
   *
   * specify ifNotExists to only execute if the property does not exist
   */
  set: (value: T, ifNotExists?: boolean) => R

  /**
   * appends one or more values to the start or end of a list, value must map to ListAttribute
   */
  appendToList: (value: T | Array<ExtractListType<T>> | Set<ExtractListType<T>>, position?: 'START' | 'END') => R

  /* ----------------------------------------------------------------
      REMOVE operations
   ---------------------------------------------------------------- */
  /**
   * removes the attribute from an item
   */
  remove: () => R

  /**
   * removes item(s) at the given position(s), the remaining elements are shifted
   */
  removeFromListAt: (...positions: number[]) => R

  /* ----------------------------------------------------------------
      ADD operations (only supports number and set type)
      AWS generally recommends to use SET rather than ADD
   ---------------------------------------------------------------- */
  /**
   * adds or manipulates a value to an attribute of type N(umber) or S(et), manipulation behaviour differs based on attribute type
   * for numbers AWS generally recommends to use SET rather than ADD. See incrementBy and decrementBy.
   *
   * @param values {multiple values as Array | Set}
   *
   * --update-expression "ADD QuantityOnHand :q" \
   * --expression-attribute-values '{":q": {"N": "5"}}' \
   *
   *  --update-expression "ADD Color :c" \
   *  --expression-attribute-values '{":c": {"SS":["Orange", "Purple"]}}' \
   */
  add: (values: T | Array<ExtractListType<T>> | Set<ExtractListType<T>>) => R

  /* ----------------------------------------------------------------
      DELETE operation (only supports set type)
   ---------------------------------------------------------------- */
  /**
   * delete items from sets
   * @param values {multiple values as Array | Set}
   * @returns {R}
   *
   * --update-expression "DELETE Color :p" \
   * --expression-attribute-values '{":p": {"SS": ["Yellow", "Purple"]}}'
   */
  removeFromSet: (values: T | Array<ExtractListType<T>> | Set<ExtractListType<T>>) => R
}

export type UpdateExpressionDefinitionChainTyped<T, K extends keyof T> = UpdateFunctions<
  T[K],
  UpdateExpressionDefinitionFunction
>

export type UpdateExpressionDefinitionChain = UpdateFunctions<any, UpdateExpressionDefinitionFunction>

export type RequestUpdateFunction<R extends ConditionalParamsHost, T, K extends keyof T> = UpdateFunctions<T[K], R>
