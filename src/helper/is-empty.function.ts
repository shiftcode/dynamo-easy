export function isEmpty(val?: object | string): boolean {
  return Object.keys(val || {}).length === 0
}
