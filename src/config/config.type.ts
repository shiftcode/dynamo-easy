import { LogReceiver } from '../logger/log-receiver.type'
import { MapperForType } from '../mapper'
import { ModelConstructor } from '../model'

export interface Config {
  logReceiver: LogReceiver
  dateMapper: ModelConstructor<MapperForType<any, any>>
}
