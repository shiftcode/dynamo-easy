/**
 * @module dynamo-easy
 */
/**
 * Type for the session validity ensurer
 */
export type SessionValidityEnsurer = () => Promise<void>
