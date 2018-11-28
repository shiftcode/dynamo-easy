import { LogReceiver } from '../logger'
import { MapperForType } from '../mapper'

export interface Config {
  logReceiver: LogReceiver
  dateMapper: MapperForType<any, any>
}
