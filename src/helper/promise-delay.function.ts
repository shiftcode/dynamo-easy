/**
 * @module helper
 */
/**
 * Will resolve after given duration
 *
 * @hidden
 */
export function promiseDelay<T>(duration: number): (arg: T) => Promise<T> {
  return (arg: T) => new Promise((resolve, reject) => setTimeout(() => resolve(arg), duration))
}
