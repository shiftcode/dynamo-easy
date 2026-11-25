import { updateDynamoEasyConfig } from "../../src/config/update-config.function";
import { DEFAULT_TABLE_NAME_RESOLVER } from "../../src/dynamo/default-table-name-resolver.const";
import { DEFAULT_LOG_RECEIVER } from "../../src/logger/default-log-receiver.const";
import { dateToStringMapper } from "../../src/mapper/custom/date-to-string.mapper";

export function resetDynamoEasyConfig() {
  updateDynamoEasyConfig({
    dateMapper: dateToStringMapper,
    logReceiver: DEFAULT_LOG_RECEIVER,
    tableNameResolver: DEFAULT_TABLE_NAME_RESOLVER,
  });
}
