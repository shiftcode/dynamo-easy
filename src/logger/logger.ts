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

export type OptModelLogFn = (
  message: string,
  modelConstructor: ModelConstructor<any> | undefined | null,
  data?: any,
) => void

/**
 * @hidden
 */
export interface Logger {
  warn: LogFn
  info: LogFn
  debug: LogFn
  verbose: LogFn
}

/**
 * @hidden
 */
export interface OptModelLogger {
  warn: OptModelLogFn
  info: OptModelLogFn
  debug: OptModelLogFn
  verbose: OptModelLogFn
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
function getOptModelLogFn(className: string, level: LogLevel): OptModelLogFn {
  return (message: string, modelConstructor: ModelConstructor<any> | undefined | null, data?: any) => {
    dynamoEasyConfig.logReceiver({
      className,
      modelConstructor: (modelConstructor && modelConstructor.name) || 'NO_MODEL',
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
    warn: getLogFn(className, modelConstructor.name, LogLevel.WARNING),
    info: getLogFn(className, modelConstructor.name, LogLevel.INFO),
    debug: getLogFn(className, modelConstructor.name, LogLevel.DEBUG),
    verbose: getLogFn(className, modelConstructor.name, LogLevel.VERBOSE),
  }
}
/**
 * @hidden
 */
export function createOptModelLogger(className: string): OptModelLogger {
  return {
    warn: getOptModelLogFn(className, LogLevel.WARNING),
    info: getOptModelLogFn(className, LogLevel.INFO),
    debug: getOptModelLogFn(className, LogLevel.DEBUG),
    verbose: getOptModelLogFn(className, LogLevel.VERBOSE),
  }
}
