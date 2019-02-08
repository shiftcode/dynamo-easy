/**
 * @module logger
 * @preferred
 *
 * Logger used in dynamo-easy
 */
import { dynamoEasyConfig } from '../config/dynamo-easy-config'
import { ModelConstructor } from '../model/model-constructor'
import { LogLevel } from './log-level.type'

/**
 * @hidden
 */
export type LogFn = (message: string, data?: any) => void

/**
 * @hidden
 */
export interface Logger {
  warn: LogFn
  info: LogFn
  debug: LogFn
}

/**
 * @hidden
 */
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

/**
 * @hidden
 */
export function createLogger(className: string, modelConstructor: ModelConstructor<any>): Logger {
  return {
    warn: getLogFn(className, modelConstructor.name, 'warning'),
    info: getLogFn(className, modelConstructor.name, 'info'),
    debug: getLogFn(className, modelConstructor.name, 'debug'),
  }
}
