// tslint:disable:max-classes-per-file
import { GSIPartitionKey } from '../index/gsi-partition-key.decorator'
import { GSISortKey } from '../index/gsi-sort-key.decorator'
import { LSISortKey } from '../index/lsi-sort-key.decorator'
import { PartitionKey } from '../key/partition-key.decorator'
import { modelErrors } from './errors.const'
import { Model } from './model.decorator'

const IX_NAME = 'anIndexName'

describe('@model decorator', () => {
  describe('getGlobalSecondaryIndexes', () => {
    // throws on applying decorator

    it('throws when defining multiple partitionKeys for same gsi', () => {
      expect(() => {
        @Model()
        // @ts-ignore
        class FailModel {
          @GSIPartitionKey(IX_NAME)
          pk1: string
          @GSIPartitionKey(IX_NAME)
          pk2: string
          @GSISortKey(IX_NAME)
          sk1: string
        }
      }).toThrow(modelErrors.gsiMultiplePk(IX_NAME, 'pk2'))
    })
    it('throws when defining multiple sortKeys for same gsi', () => {
      expect(() => {
        @Model()
        // @ts-ignore
        class FailModel {
          @GSIPartitionKey(IX_NAME)
          pk1: string
          @GSISortKey(IX_NAME)
          sk1: string
          @GSISortKey(IX_NAME)
          sk2: string
        }
      }).toThrow(modelErrors.gsiMultipleSk(IX_NAME, 'sk2'))
    })
  })
  describe('getLocalSecondaryIndexes', () => {
    it('throws when defining LSI sortKey but no PartitionKey', () => {
      expect(() => {
        @Model()
        // @ts-ignore
        class FailModel {
          @LSISortKey(IX_NAME)
          sk1: string
        }
      }).toThrow(modelErrors.lsiRequiresPk(IX_NAME, 'sk1'))
    })
    it('throws when defining multiple sortKeys for same lsi', () => {
      expect(() => {
        @Model()
        // @ts-ignore
        class FailModel {
          @PartitionKey()
          pk1: string
          @LSISortKey(IX_NAME)
          sk1: string
          @LSISortKey(IX_NAME)
          sk2: string
        }
      }).toThrow(modelErrors.lsiMultipleSk(IX_NAME, 'sk2'))
    })
  })
})
