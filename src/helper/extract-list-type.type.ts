export type ExtractListType<T> =
  T extends Array<(infer A)> ? A :
    T extends Set<(infer B)> ? B :
      never;
