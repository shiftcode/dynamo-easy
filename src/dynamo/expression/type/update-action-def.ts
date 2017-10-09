import { UpdateActionKeyword } from './update-action-keyword.type'
import { UpdateAction } from './update-action.type'

export class UpdateActionDef {
  actionKeyword: UpdateActionKeyword
  action: UpdateAction

  constructor(actionKeyWord: UpdateActionKeyword, action: UpdateAction) {
    this.actionKeyword = actionKeyWord
    this.action = action
  }
}
