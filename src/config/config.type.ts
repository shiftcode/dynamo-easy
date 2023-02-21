/**
 * @module dynamo-easy
 */
import { SessionValidityEnsurer } from '../dynamo/session-validity-ensurer.type'
import { TableNameResolver } from '../dynamo/table-name-resolver.type'
import { LogReceiver } from '../logger/log-receiver.type'
import { MapperForType } from '../mapper/for-type/base.mapper'

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
   * @deprecated v3: should be replaced by using the default middleware stack provided by aws-sdk v3
   */
  sessionValidityEnsurer: SessionValidityEnsurer
}
