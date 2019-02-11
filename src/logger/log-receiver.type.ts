/**
 * @module logger
 */
import { LogInfo } from './log-info.type'

export type LogReceiver = (logInfo: LogInfo) => any | void
