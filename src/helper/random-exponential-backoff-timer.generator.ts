/**
 * @module helper
 */
/**
 * returns a random value from an increasing range by each iteration.
 */
export function* randomExponentialBackoffTimer() {
  let i = 0
  while (true) {
    yield (Math.pow(2, Math.round(Math.random() * ++i)) - 1) / 2
  }
}
