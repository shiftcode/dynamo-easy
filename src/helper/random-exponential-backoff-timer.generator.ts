export function* randomExponentialBackoffTimer(throttleTimeSlot: number) {
  let i = 0
  while (true) {
    yield ((Math.pow(2, Math.round(Math.random() * ++i)) - 1) / 2) * throttleTimeSlot
  }
}
