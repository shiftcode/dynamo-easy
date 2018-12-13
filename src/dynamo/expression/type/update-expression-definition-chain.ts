import { UpdateExpressionDefinitionFunction } from './update-expression-definition-function'

type ExtractListType<T> =
  T extends Array<(infer A)> ? A :
    T extends Set<(infer B)> ? B :
      T;



/**
 * see http://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.UpdateExpressions.html for full documentation
 */
export interface UpdateExpressionDefinitionChainTyped<T, K extends keyof T> {
  /* ----------------------------------------------------------------
      SET operation TODO add support for ifNotExists (#16)
   ---------------------------------------------------------------- */
  incrementBy: (value: number) => UpdateExpressionDefinitionFunction
  decrementBy: (value: number) => UpdateExpressionDefinitionFunction

  /**
   * will update the item at the path, path can be a top level attribute or a nested attribute.
   * samples:
   * - persons.age
   * - places[0].address.street
   */
  set: (value: T[K], ifNotExists?: boolean) => UpdateExpressionDefinitionFunction

  /**
   * appends one or more values to the start or end of a list, value must be of type L(ist)
   */
  appendToList: (value: Array<ExtractListType<T[K]>> | Set<ExtractListType<T[K]>>, position?: 'START' | 'END') => UpdateExpressionDefinitionFunction

  /* ----------------------------------------------------------------
      REMOVE operation
   ---------------------------------------------------------------- */
  remove: () => UpdateExpressionDefinitionFunction

  /** removes an item at the given position(s), the remaining elements are shifted */
  removeFromListAt: (...positions: number[]) => UpdateExpressionDefinitionFunction

  /* ----------------------------------------------------------------
      ADD operation (only supports number and set type)
      AWS generally recommends to use SET rather than ADD
   ---------------------------------------------------------------- */
  /**
   * adds or manipulates a value to an attribute of type N(umber) or S(et), manipulation behaviour differs based on attribute type
   *
   * @param values {multiple values as Array | Set}
   *
   * --update-expression "ADD QuantityOnHand :q" \
   * --expression-attribute-values '{":q": {"N": "5"}}' \
   *
   *  --update-expression "ADD Color :c" \
   *  --expression-attribute-values '{":c": {"SS":["Orange", "Purple"]}}' \
   */
  add: (values: Array<ExtractListType<T[K]>> | Set<ExtractListType<T[K]>>) => UpdateExpressionDefinitionFunction

  /* ----------------------------------------------------------------
      DELETE operation (only supports set type)
   ---------------------------------------------------------------- */
  /**
   * @param values {multiple values as Array | Set}
   * @returns {UpdateExpressionDefinitionFunction}
   *
   * --update-expression "DELETE Color :p" \
   * --expression-attribute-values '{":p": {"SS": ["Yellow", "Purple"]}}'
   */
  removeFromSet: (values: Array<ExtractListType<T[K]>> | Set<ExtractListType<T[K]>>) => UpdateExpressionDefinitionFunction
}

/**
 * see http://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.UpdateExpressions.html for full documentation
 */
export interface UpdateExpressionDefinitionChain {
  /* ----------------------------------------------------------------
      SET operation TODO add support for ifNotExists (#16)
   ---------------------------------------------------------------- */
  incrementBy: (value: number) => UpdateExpressionDefinitionFunction
  decrementBy: (value: number) => UpdateExpressionDefinitionFunction

  /**
   * will update the item at the path, path can be a top level attribute or a nested attribute.
   * samples:
   * - persons.age
   * - places[0].address.street
   */
  set: (value: any, ifNotExists?: boolean) => UpdateExpressionDefinitionFunction

  /**
   * appends one or more values to the start or end of a list, value must be of type L(ist)
   */
  appendToList: (value: any[], position?: 'START' | 'END') => UpdateExpressionDefinitionFunction

  /* ----------------------------------------------------------------
      REMOVE operation
   ---------------------------------------------------------------- */
  remove: () => UpdateExpressionDefinitionFunction

  /** removes an item at the given position(s), the remaining elements are shifted */
  removeFromListAt: (...positions: number[]) => UpdateExpressionDefinitionFunction

  /* ----------------------------------------------------------------
      ADD operation (only supports number and set type)
      AWS generally recommends to use SET rather than ADD
   ---------------------------------------------------------------- */

  /**
   * adds or manipulates a value to an attribute of type N(umber) or S(et), manipulation behaviour differs based on attribute type
   *
   * @param values {multiple values as vararg | Array | Set}
   *
   * --update-expression "ADD QuantityOnHand :q" \
   * --expression-attribute-values '{":q": {"N": "5"}}' \
   *
   *  --update-expression "ADD Color :c" \
   *  --expression-attribute-values '{":c": {"SS":["Orange", "Purple"]}}' \
   */
  add: (...values: any[]) => UpdateExpressionDefinitionFunction

  /* ----------------------------------------------------------------
      DELETE operation (only supports set type)
   ---------------------------------------------------------------- */
  /**
   * @param values {multiple values as vararg | Array | Set}
   * @returns {UpdateExpressionDefinitionFunction}
   *
   * --update-expression "DELETE Color :p" \
   * --expression-attribute-values '{":p": {"SS": ["Yellow", "Purple"]}}'
   */
  removeFromSet: (...values: any[]) => UpdateExpressionDefinitionFunction
}
