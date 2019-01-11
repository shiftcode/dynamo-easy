import { dynamoEasyConfig } from '../config/dynamo-easy-config'
import { ModelConstructor } from '../model'
import { LogLevel } from './log-level.type'

export type LogFn = (message: string, data?: any) => void

export interface Logger {
  warn: LogFn
  info: LogFn
  debug: LogFn
}

function getLogFn(className: string, modelConstructor: string, level: LogLevel): LogFn {
  return (message: string, data?: any) => {
    dynamoEasyConfig.logReceiver({
      className,
      modelConstructor,
      level,
      message,
      data,
      timestamp: Date.now(),
    })
  }
}

export function createLogger(className: string, modelConstructor: ModelConstructor<any>): Logger {
  return {
    warn: getLogFn(className, modelConstructor.name, 'warning'),
    info: getLogFn(className, modelConstructor.name, 'info'),
    debug: getLogFn(className, modelConstructor.name, 'debug'),
  }
}
