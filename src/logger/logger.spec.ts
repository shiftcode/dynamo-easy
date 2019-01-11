import { Employee } from '../../test/models'
import { updateDynamoEasyConfig } from '../config'
import { DynamoStore } from '../dynamo'
import { LogInfo } from './log-info.type'
import { LogReceiver } from './log-receiver.type'

describe('log receiver', () => {
  let logs: LogInfo[] = []
  const logReceiver: LogReceiver = logInfo => logs.push(logInfo)
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
