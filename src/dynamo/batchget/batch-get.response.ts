/**
 * @module multi-model-requests/batch-get
 */
/**
 * Response from {@link BatchGetRequest}::exec
 */
// tslint:disable-next-line:interface-over-type-literal
export type BatchGetResponse = Record<string /* tableName */, any[]>
