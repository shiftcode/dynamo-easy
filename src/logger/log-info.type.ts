/**
 * @module logger
 */
import { LogLevel } from './log-level.type'

/**
 * type for log statements
 */
export interface LogInfo {
  className: string
  modelConstructor: string
  level: LogLevel
  message: string
  timestamp: number
  data?: any
}
