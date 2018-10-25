export function notNull<TValue>(value: TValue | null): value is TValue {
  return value !== null
}
