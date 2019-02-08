/**
 * @module multi-model-requests/batch-write
 */

/**
 * max count of request items allowed by aws
 */
export const BATCH_WRITE_MAX_REQUEST_ITEM_COUNT = 25

/**
 * time slot used to wait after unprocessed items were returned
 */
export const BATCH_WRITE_DEFAULT_TIME_SLOT = 1000
