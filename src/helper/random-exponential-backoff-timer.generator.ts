/**
 * @module helper
 */
/**
 * returns a random value from an exponentially increasing range by each iteration ("full jitter"):
 * [0, 0.5), [0, 1.5), [0, 3.5), [0, 7.5), ...
 * @see https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/
 */
export function* randomExponentialBackoffTimer() {
  let i = 0
  while (true) {
    yield (Math.random() * (Math.pow(2, ++i) - 1)) / 2
  }
}
