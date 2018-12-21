/**
 * extracts the type of an Array or Set
 *
 * ExtractListType<string[]> => string
 * ExtractListType<Set<string>> => string
 */
export type ExtractListType<T> =
  T extends Array<(infer A)> ? A :
    T extends Set<(infer B)> ? B :
      never;
