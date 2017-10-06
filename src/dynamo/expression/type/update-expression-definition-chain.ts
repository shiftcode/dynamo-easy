import { UpdateExpressionDefinitionFunction } from './update-expression-definition-function'

/**
 * see http://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.UpdateExpressions.html for full documentation
 */
export interface UpdateExpressionDefinitionChain {
  // SET operation TODO add support for ifNotExists
  incrementBy: (value: number) => UpdateExpressionDefinitionFunction
  decrementBy: (value: number) => UpdateExpressionDefinitionFunction
  set: (value: any) => UpdateExpressionDefinitionFunction
  setAt: (value: any, at: number) => UpdateExpressionDefinitionFunction

  /**
   * appends one or more values to the start or end of a list, value must be of type L(ist)
   */
  appendToList: (value: any, position: 'START' | 'END') => UpdateExpressionDefinitionFunction

  // REMOVE operation
  remove: () => UpdateExpressionDefinitionFunction

  /** removes an item at the given position(s), the remaining elements are shifted */
  removeFromListAt: (...positions: number[]) => UpdateExpressionDefinitionFunction

  // ADD operation (only supports number and set type)

  /**
   *  adds or manipulates a value, manipulation behaviour differs based on type of attribute
   *
   * --update-expression "ADD QuantityOnHand :q" \
   * --expression-attribute-values '{":q": {"N": "5"}}' \
   *
   *  --update-expression "ADD Color :c" \
   *  --expression-attribute-values '{":c": {"SS":["Orange", "Purple"]}}' \
   */
  add: (value: any) => UpdateExpressionDefinitionFunction

  // DELETE operation (only supports set type)

  /**
   *
   * --update-expression "DELETE Color :p" \
   * --expression-attribute-values '{":p": {"SS": ["Yellow", "Purple"]}}' \
   */
  removeFromSet: (values: Set<any>) => UpdateExpressionDefinitionFunction
}
