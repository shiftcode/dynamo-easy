# Migrate dynamo-easy to aws-sdk v3

## 📋 To complete before releasing

- [x] Make sure the snippets compile
- [x] Make tests compile and run successfully
- [x] Search for `TODO v3:` in the code to see open issues / notes, and create followup issues to decide if we have more to fix prior to a major release or keep it for later follow-up
- [ ] Check on new attribute type [$UnknownAttribute](./src/mapper/type/attribute.type.ts) and implement tests
- [x] Remove [sessionValidityEnsurer](./src/config/dynamo-easy-config.ts) and add demo with using [middleware stack](https://github.com/aws/aws-sdk-js-v3#middleware-stack)
      to implement the same
  - [x] The old behavior (sessionValidityEnsurer) was executed before every request, with the new implementation we
        only react to failing requests, so we should probably provide a way to automatically retry failed requests after
        successfully refreshing any invalid session.
- [ ] Switch to new implementation of pagination, see [official doc](https://github.com/aws/aws-sdk-js-v3#paginators).
- [ ] ~~Use middleware stack to implement verbose logging of request / response data~~
- [x] Update [dynamo-easy-demo](https://github.com/shiftcode/dynamo-easy-demo) see [this](https://github.com/shiftcode/dynamo-easy-demo/issues/1) issue
- [ ] Check if we still need to implement our custom retry backoff behaviour, since it seems that v3 has some reasonable default behaviour. (see [https://github.com/aws/aws-sdk-js-v3?tab=readme-ov-file#example-pagination-usage](https://github.com/smithy-lang/smithy-typescript/blob/main/packages/util-retry/README.md#default))

## 💥 Breaking changes

### `DynamoDBClient` instead of the aggregated `DynamoDB` client

dynamo-easy now calls the modular `DynamoDBClient` directly with commands (`client.send(new GetItemCommand(params))`).
`DynamoStore`, `BatchGetRequest`, `BatchWriteRequest`, `TransactGetRequest` and `TransactWriteRequest` take a
`DynamoDBClient` in their constructor instead of a `DynamoDB` instance. The same applies to all store request classes
(`GetRequest`, `PutRequest`, `UpdateRequest`, `DeleteRequest`, `QueryRequest`, `ScanRequest`,
`BatchGetSingleTableRequest`, `BatchWriteSingleTableRequest`, `TransactGetSingleTableRequest`), which previously took
the internal `DynamoDbWrapper`.

```ts
// before
import { DynamoDB } from '@aws-sdk/client-dynamodb'
const store = new DynamoStore(Person, new DynamoDB({}))

// after
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
const store = new DynamoStore(Person, new DynamoDBClient({}))
```

### `dynamoDB` getter replaced by `client`

The `get dynamoDB()` getter on `DynamoStore`, `BatchGetRequest`, `BatchWriteRequest`, `TransactGetRequest` and
`TransactWriteRequest` was removed. Use the `readonly client: DynamoDBClient` property instead. Store request classes
expose `client` instead of `dynamoDBWrapper`.

### `DynamoDbWrapper` removed

`DynamoDbWrapper` was removed. Use the `DynamoDBClient` with commands directly. The `key condition expression must be defined` check moved from the wrapper into `QueryRequest`.

### Responses include `$metadata`

Responses are typed with the SDK `*CommandOutput` types. `execNoMap()` results and the `execFullResponse()` results of
`GetRequest`, `PutRequest`, `UpdateRequest`, `DeleteRequest`, `QueryRequest`, `ScanRequest`, `BatchWriteRequest`,
`BatchWriteSingleTableRequest`, `TransactWriteRequest` and `TransactGetSingleTableRequest` include the `$metadata`
property of the response.

### Response types extend the SDK output types

`GetResponse`, `QueryResponse`, `ScanResponse`, `PutResponse`, `UpdateResponse`, `DeleteResponse`,
`BatchGetSingleTableResponse`, `BatchGetFullResponse` and `TransactGetFullResponse` now extend the corresponding SDK
output type (with the raw item(s) replaced by the mapped model item(s)) instead of redeclaring a subset of its fields.
All other fields of the SDK output (e.g. `ScannedCount`, `LastEvaluatedKey`, `ItemCollectionMetrics`) are therefore
available on the typed response as well.

## Useful Links

- [Doc in Repo](https://github.com/aws/aws-sdk-js-v3)
- [Official migration Guide](https://github.com/aws/aws-sdk-js-v3/blob/main/UPGRADING.md)
