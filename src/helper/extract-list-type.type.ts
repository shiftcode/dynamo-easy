/**
 * @module helper
 */
/**
 * extracts the type of an Array or Set. if neither array nor set, never is returned
 *
 * ExtractListType<string[]> => string
 * ExtractListType<Set<string>> => string
 *
 * @hidden
 */
export type ExtractListType<T> = T extends Array<infer A> ? A : T extends Set<infer B> ? B : never
