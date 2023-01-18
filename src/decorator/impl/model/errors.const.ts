/**
 * @module decorators
 */

/**
 * @hidden
 */
export const modelErrors = {
  gsiMultiplePk: (indexName: string, propDbName: string) =>
    `there is already a partition key defined for global secondary index ${indexName} (property name: ${propDbName})`,
  gsiMultipleSk: (indexName: string, propDbName: string) =>
    `there is already a sort key defined for global secondary index ${indexName} (property name: ${propDbName})`,
  lsiMultipleSk: (indexName: string, propDbName: string) =>
    `only one sort key can be defined for the same local secondary index, ${propDbName} is already defined as sort key for index ${indexName}`,
  lsiRequiresPk: (indexName: string, _propDbName: string) =>
    `the  local secondary index ${indexName} requires the partition key to be defined`,
}
