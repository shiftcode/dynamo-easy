import { dynamoEasyConfig } from '../config/dynamo-easy-config'
import { ModelConstructor } from '../model'
import { LogLevel } from './log-level.type'

export type LogFn = (message: string, data?: any) => void

export interface Logger {
  warn: LogFn
  info: LogFn
  debug: LogFn
}

function getLogFn(className: string, modelClass: string, level: LogLevel): LogFn {
  return (message: string, data?: any) => {
    dynamoEasyConfig.logReceiver({
      className,
      modelClass,
      level,
      message,
      data,
      timestamp: Date.now(),
    })
  }
}

export function createLogger(className: string, modelClass: ModelConstructor<any>): Logger {
  return {
    warn: getLogFn(className, modelClass.name, 'warning'),
    info: getLogFn(className, modelClass.name, 'info'),
    debug: getLogFn(className, modelClass.name, 'debug'),
  }
}
