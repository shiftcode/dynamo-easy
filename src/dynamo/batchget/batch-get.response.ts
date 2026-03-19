/**
 * @module multi-model-requests/batch-get
 */
/**
 * Response from {@link BatchGetRequest}::exec
 */
export type BatchGetResponse = Record<string /* tableName */, any[]>
