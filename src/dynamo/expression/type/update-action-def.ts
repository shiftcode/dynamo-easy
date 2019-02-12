/**
 * @module expression
 */
import { UpdateActionKeyword } from './update-action-keyword.type'
import { UpdateAction } from './update-action.type'

export class UpdateActionDef {
  constructor(public actionKeyword: UpdateActionKeyword, public action: UpdateAction) {}
}
