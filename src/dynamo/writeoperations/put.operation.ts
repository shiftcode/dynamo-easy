import { hasSortKey } from '../../decorator/metadata'
import { toDb } from '../../mapper'
import { ModelConstructor } from '../../model'
import { attribute } from '../expression/logical-operator'
import { ConditionExpressionDefinitionFunction } from '../expression/type'
import { WriteOperation } from './write-operation'
import { PutOperationParams } from './write-operation-params.type'

export class PutOperation<T> extends WriteOperation<T, PutOperationParams<T>, PutOperation<T>> {

  constructor(
    modelClazz: ModelConstructor<T>,
    item: T,
  ) {
    super(modelClazz)
    this.params.Item = toDb(item, this.modelClazz)
  }

  /**
   * Adds a condition expression to the request, which makes sure the item will only be saved if the id does not exist
   * @returns {PutRequest<T>}
   */
  ifNotExists(predicate: boolean = true): PutOperation<T> {
    if (predicate) {
      const conditionDefFns: ConditionExpressionDefinitionFunction[] = [
        attribute<T>(this.metadata.getPartitionKey()).attributeNotExists()
      ]

      if (hasSortKey(this.metadata)) {
        conditionDefFns.push(attribute<T>(this.metadata.getSortKey()).attributeNotExists())
      }

      this.onlyIf(...conditionDefFns)
    }
    return this
  }

}
