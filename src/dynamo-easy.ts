//
// Reflect Metadata
// FIXME: Remove reflect-metadata as hard dep (lib using project needs to import it)
// - possible singleton override issues and it's a shim eg. runtime dependent in future --> es7
//
import 'reflect-metadata'

//
// Export public api of the library
//
export * from './config'
export * from './decorator'
export * from './dynamo'
export * from './logger'
export * from './mapper'
export * from './model'
