import { updateDynamoEasyConfig } from '../../src/config'
import { DEFAULT_SESSION_VALIDITY_ENSURER } from '../../src/dynamo/default-session-validity-ensurer.const'
import { DEFAULT_TABLE_NAME_RESOLVER } from '../../src/dynamo/default-table-name-resolver.const'
import { DEFAULT_LOG_RECEIVER } from '../../src/logger/default-log-receiver.const'
import { DateToStringMapper } from '../../src/mapper/custom'

export function resetDynamoEasyConfig() {
  updateDynamoEasyConfig({
    dateMapper: DateToStringMapper,
    logReceiver: DEFAULT_LOG_RECEIVER,
    tableNameResolver: DEFAULT_TABLE_NAME_RESOLVER,
    sessionValidityEnsurer: DEFAULT_SESSION_VALIDITY_ENSURER,
  })
}
