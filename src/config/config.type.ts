import { MapperForType } from '../mapper'
import { ModelConstructor } from '../model'

export interface Config {
  dateMapper: ModelConstructor<MapperForType<any, any>>
  debug: boolean
}
