import { LogLevel } from './log-level.type'

export interface LogInfo {
  className: string
  modelClass: string
  level: LogLevel
  message: string
  timestamp: number
  data?: any
}
