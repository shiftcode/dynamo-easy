import { TableNameResolver } from '../dynamo'
import { SessionValidityEnsurer } from '../dynamo/session-validity-ensurer.type'
import { LogReceiver } from '../logger'
import { MapperForType } from '../mapper'

/**
 * the global config object
 */
export interface Config {
  /**
   * function receiving all the log statements
   */
  logReceiver: LogReceiver
  /**
   * mapper used for {@link DateProperty} decorated properties
   */
  dateMapper: MapperForType<any, any>
  /**
   * function used to create the table names
   */
  tableNameResolver: TableNameResolver
  /**
   * function called before calling dynamoDB api
   */
  sessionValidityEnsurer: SessionValidityEnsurer
}
