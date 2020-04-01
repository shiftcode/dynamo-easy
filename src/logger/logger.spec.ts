import { Employee, SimpleModel } from '../../test/models'
import { updateDynamoEasyConfig } from '../config/update-config.function'
import { DynamoStore } from '../dynamo/dynamo-store'
import { LogInfo } from './log-info.type'
import { LogLevel } from './log-level.type'
import { LogReceiver } from './log-receiver.type'
import { createLogger, createOptModelLogger, Logger, OptModelLogger } from './logger'

describe('log receiver', () => {
  let logs: LogInfo[] = []
  const logReceiver: LogReceiver = (logInfo) => logs.push(logInfo)
  updateDynamoEasyConfig({ logReceiver })

  beforeEach(() => (logs = []))

  it('receives logs', () => {
    const ts = Date.now()
    const store = new DynamoStore(Employee)

    expect(store).toBeDefined()
    expect(logs.length).toBe(1)
    expect(logs[0].timestamp).toBeGreaterThanOrEqual(ts)
    expect(logs[0].modelConstructor).toBe(Employee.name)
  })
})

describe('createLogger', () => {
  let logReceiver: jest.Mock
  let logger: Logger
  beforeEach(() => {
    logReceiver = jest.fn()
    updateDynamoEasyConfig({ logReceiver })
    logger = createLogger('MyClass', SimpleModel)
  })
  it('creates correct Logger instance with working warn function', () => {
    logger.warn('warn')
    expect(logReceiver).toBeCalledTimes(1)
    expect(logReceiver.mock.calls[0][0]).toBeDefined()
    expect(logReceiver.mock.calls[0][0].className).toEqual('MyClass')
    expect(logReceiver.mock.calls[0][0].modelConstructor).toEqual('SimpleModel')
    expect(logReceiver.mock.calls[0][0].message).toEqual('warn')
    expect(logReceiver.mock.calls[0][0].level).toEqual(LogLevel.WARNING)
  })
  it('creates correct Logger instance with working info function', () => {
    logger.info('info')
    expect(logReceiver).toBeCalledTimes(1)
    expect(logReceiver.mock.calls[0][0]).toBeDefined()
    expect(logReceiver.mock.calls[0][0].className).toEqual('MyClass')
    expect(logReceiver.mock.calls[0][0].modelConstructor).toEqual('SimpleModel')
    expect(logReceiver.mock.calls[0][0].message).toEqual('info')
    expect(logReceiver.mock.calls[0][0].level).toEqual(LogLevel.INFO)
  })
  it('creates correct Logger instance with working debug function', () => {
    logger.debug('debug')
    expect(logReceiver).toBeCalledTimes(1)
    expect(logReceiver.mock.calls[0][0]).toBeDefined()
    expect(logReceiver.mock.calls[0][0].className).toEqual('MyClass')
    expect(logReceiver.mock.calls[0][0].modelConstructor).toEqual('SimpleModel')
    expect(logReceiver.mock.calls[0][0].message).toEqual('debug')
    expect(logReceiver.mock.calls[0][0].level).toEqual(LogLevel.DEBUG)
  })
  it('creates correct Logger instance with working debug function', () => {
    logger.verbose('verbose')
    expect(logReceiver).toBeCalledTimes(1)
    expect(logReceiver.mock.calls[0][0]).toBeDefined()
    expect(logReceiver.mock.calls[0][0].className).toEqual('MyClass')
    expect(logReceiver.mock.calls[0][0].modelConstructor).toEqual('SimpleModel')
    expect(logReceiver.mock.calls[0][0].message).toEqual('verbose')
    expect(logReceiver.mock.calls[0][0].level).toEqual(LogLevel.VERBOSE)
  })
})

describe('createOptModelLogger', () => {
  let logReceiver: jest.Mock
  let logger: OptModelLogger
  beforeEach(() => {
    logReceiver = jest.fn()
    updateDynamoEasyConfig({ logReceiver })
    logger = createOptModelLogger('MyClass')
  })
  it('creates correct OptModelLogger instance with working warn function', () => {
    logger.warn('warn', SimpleModel)
    expect(logReceiver).toBeCalledTimes(1)
    expect(logReceiver.mock.calls[0][0]).toBeDefined()
    expect(logReceiver.mock.calls[0][0].className).toEqual('MyClass')
    expect(logReceiver.mock.calls[0][0].modelConstructor).toEqual('SimpleModel')
    expect(logReceiver.mock.calls[0][0].message).toEqual('warn')
    expect(logReceiver.mock.calls[0][0].level).toEqual(LogLevel.WARNING)
  })
  it('creates correct OptModelLogger instance with working info function', () => {
    logger.info('info', SimpleModel)
    expect(logReceiver).toBeCalledTimes(1)
    expect(logReceiver.mock.calls[0][0]).toBeDefined()
    expect(logReceiver.mock.calls[0][0].className).toEqual('MyClass')
    expect(logReceiver.mock.calls[0][0].modelConstructor).toEqual('SimpleModel')
    expect(logReceiver.mock.calls[0][0].message).toEqual('info')
    expect(logReceiver.mock.calls[0][0].level).toEqual(LogLevel.INFO)
  })
  it('creates correct OptModelLogger instance with working debug function', () => {
    logger.debug('debug', SimpleModel)
    expect(logReceiver).toBeCalledTimes(1)
    expect(logReceiver.mock.calls[0][0]).toBeDefined()
    expect(logReceiver.mock.calls[0][0].className).toEqual('MyClass')
    expect(logReceiver.mock.calls[0][0].modelConstructor).toEqual('SimpleModel')
    expect(logReceiver.mock.calls[0][0].message).toEqual('debug')
    expect(logReceiver.mock.calls[0][0].level).toEqual(LogLevel.DEBUG)
  })
  it('creates correct OptModelLogger instance with working verbose function', () => {
    logger.verbose('verbose', SimpleModel)
    expect(logReceiver).toBeCalledTimes(1)
    expect(logReceiver.mock.calls[0][0]).toBeDefined()
    expect(logReceiver.mock.calls[0][0].className).toEqual('MyClass')
    expect(logReceiver.mock.calls[0][0].modelConstructor).toEqual('SimpleModel')
    expect(logReceiver.mock.calls[0][0].message).toEqual('verbose')
    expect(logReceiver.mock.calls[0][0].level).toEqual(LogLevel.VERBOSE)
  })
})
