/**
 * @module multi-model-requests/batch-get
 */
/**
 * max count of request items allowed by aws
 */
export const BATCH_GET_MAX_REQUEST_ITEM_COUNT = 100

/**
 * time slot used to wait after unprocessed items were returned
 */
export const BATCH_GET_DEFAULT_TIME_SLOT = 1000

/**
 * max time in ms to wait between follow-up requests for unprocessed items (same as the SDK's max retry delay)
 */
export const BATCH_GET_DEFAULT_MAX_DELAY = 20_000

/**
 * max number of follow-up requests for unprocessed items before rejecting
 */
export const BATCH_GET_DEFAULT_MAX_RETRIES = 10
