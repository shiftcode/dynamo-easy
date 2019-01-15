/**
 * Will resolve after given duration
 * @param duration
 */
export function promiseDelay<T>(duration: number): (arg: T) => Promise<T> {
  return (arg: T) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => resolve(arg), duration)
    })
  }
}
