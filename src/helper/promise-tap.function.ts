export function promiseTap<T>(tapFunction: (arg: T) => void): (arg: T) => Promise<T> {
  return (arg: T) => {
    tapFunction(arg)
    return Promise.resolve(arg)
  }
}
