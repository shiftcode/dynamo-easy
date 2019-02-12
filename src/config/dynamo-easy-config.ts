/**
 * @module dynamo-easy
 */
import { DEFAULT_SESSION_VALIDITY_ENSURER } from '../dynamo/default-session-validity-ensurer.const'
import { DEFAULT_TABLE_NAME_RESOLVER } from '../dynamo/default-table-name-resolver.const'
import { DEFAULT_LOG_RECEIVER } from '../logger/default-log-receiver.const'
import { dateToStringMapper } from '../mapper/custom/date-to-string.mapper'
import { Config } from './config.type'

/**
 * to update the config you must do it before importing any model, basically before anything else.
 * the config cannot be changed afterwards
 */
export const dynamoEasyConfig: Config = {
  dateMapper: dateToStringMapper,
  logReceiver: DEFAULT_LOG_RECEIVER,
  tableNameResolver: DEFAULT_TABLE_NAME_RESOLVER,
  sessionValidityEnsurer: DEFAULT_SESSION_VALIDITY_ENSURER,
}
