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
import { BaseRequest } from '../../request/base.request'

export interface RequestSortKeyConditionFunction<R extends BaseRequest<any, any>> {
  // TODO LOW:TYPINGS narrow typing when possible -> https://github.com/Microsoft/TypeScript/issues/13573
  // [key in OperatorAlias]: (...value: any[]) => R;
  [key: string]: (...value: any[]) => R
  equals: (value: any) => R
  eq: (value: any) => R
  lt: (value: any) => R
  lte: (value: any) => R
  gt: (value: any) => R
  gte: (value: any) => R
  between: (value1: any, value2: any) => R
  beginsWith: (value: any) => R
}
