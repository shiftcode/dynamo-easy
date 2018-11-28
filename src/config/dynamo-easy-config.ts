import { DateToStringMapper } from '../mapper/custom/date-to-string.mapper'
import { Config } from './config.type'

/**
 * to update the config you must do it before importing any model, basically before anything else.
 * the config cannot be changed afterwards
 */
export const dynamoEasyConfig: Config = {
  dateMapper: DateToStringMapper,
  // tslint:disable-next-line:no-empty
  logReceiver: () => {},
}
