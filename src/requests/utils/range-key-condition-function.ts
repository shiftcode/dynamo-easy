/*
 *  Valid comparisons for the sort key condition are as follows:
 *      sortKeyName = :sortkeyval - true if the sort key value is equal to :sortkeyval.
 *      sortKeyName < :sortkeyval - true if the sort key value is less than :sortkeyval.
 *      sortKeyName <= :sortkeyval - true if the sort key value is less than or equal to :sortkeyval.
 *      sortKeyName > :sortkeyval - true if the sort key value is greater than :sortkeyval.
 *      sortKeyName >= :sortkeyval - true if the sort key value is greater than or equal to :sortkeyval.
 *      sortKeyName BETWEEN :sortkeyval1 AND :sortkeyval2 - true if the sort key value is greater than or equal to :sortkeyval1, and less than or equal to :sortkeyval2.
 *      begins_with ( sortKeyName, :sortkeyval ) - true if the sort key value begins with a particular operand.
 *      (You cannot use this function with a sort key that is of formType Number.) Note that the function name begins_with is case-sensitive.
 */
import { Request } from '../request.model'

export interface RangeKeyConditionFunction<R extends Request<any, any>> {
  equals: (value: any) => R
  eq: (value: any) => R
  lte: (value: any) => R
  lt: (value: any) => R
  gte: (value: any) => R
  gt: (value: any) => R
  beginsWith: (value: any) => R
  between: (value1: any, value2: any) => R
}
