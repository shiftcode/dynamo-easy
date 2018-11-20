import { LogReceiver } from '../logger/log-receiver.type'
import { DateTypes } from './date-types.type'

export interface Config {
  dateType: DateTypes
  logReceiver: LogReceiver
}
