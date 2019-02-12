import { MapperForType, NumberAttribute } from '../../src/dynamo-easy'

export class Duration {
  value: number

  constructor(value: number) {
    this.value = value
  }

  addSeconds(val: number) {
    this.value += val
  }

  addMinutes(val: number) {
    this.value += val * 60
  }

  addHours(val: number) {
    this.value += val * 60 * 60
  }

  get asSeconds(): number {
    return this.value
  }

  get asMinutes(): number {
    return this.value / 60
  }

  get asHours(): number {
    return this.value / (60 * 60)
  }
}

export const durationMapper: MapperForType<Duration, NumberAttribute> = {
  fromDb: attr => new Duration(parseInt(attr.N, 10)),
  toDb: val => ({ N: `${val.value}` }),
}
