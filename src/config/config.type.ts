import { TableNameResolver } from '../dynamo'
import { SessionValidityEnsurer } from '../dynamo/session-validity-ensurer.type'
import { LogReceiver } from '../logger'
import { MapperForType } from '../mapper'

export interface Config {
  logReceiver: LogReceiver
  dateMapper: MapperForType<any, any>,
  tableNameResolver: TableNameResolver,
  sessionValidityEnsurer: SessionValidityEnsurer,
}
