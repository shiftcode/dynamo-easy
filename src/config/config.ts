import { MapperForType } from '../mapper/for-type/base.mapper'
import { ModelConstructor } from '../model'

export interface Config {
  dateMapper: ModelConstructor<MapperForType<any, any>>
  debug: boolean
}
