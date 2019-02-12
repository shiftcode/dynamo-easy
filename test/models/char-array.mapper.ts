import { MapperForType, StringSetAttribute } from '../../src/dynamo-easy'

/**
 * stores a string as char array
 */
export const charArrayMapper: MapperForType<string, StringSetAttribute> = {
  toDb: val => ({ SS: val.split('') }),
  fromDb: attr => attr.SS.join(),
}
