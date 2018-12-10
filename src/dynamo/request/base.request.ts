import { metadataForClass } from '../../decorator/metadata'
import { Metadata } from '../../decorator/metadata/metadata'
import { ModelConstructor } from '../../model/model-constructor'
import { DynamoRx } from '../dynamo-rx'
import { getTableName } from '../get-table-name.function'

export abstract class BaseRequest<T, I extends {}> {
  readonly dynamoRx: DynamoRx
  readonly modelClazz: ModelConstructor<T>
  readonly metadata: Metadata<T>
  readonly tableName: string
  readonly params: I

  protected constructor(dynamoRx: DynamoRx, modelClazz: ModelConstructor<T>) {
    this.dynamoRx = dynamoRx

    if (modelClazz === null || modelClazz === undefined) {
      throw new Error(`please provide the ModelConstructor for the request, won't work otherwise`)
    }
    this.modelClazz = modelClazz

    this.metadata = metadataForClass(this.modelClazz)

    if (!this.metadata.modelOptions) {
      throw new Error('given ModelConstructor has no @Model decorator')
    }

    this.tableName = getTableName(this.metadata)

    this.params = <I>{}
  }
}
