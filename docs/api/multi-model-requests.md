---
description: >-
  There are different Request you can use to read from or write to different
  tables
---

# Multi-Model Requests

### Params

Equivalent to the model requests you can access the params as property on all multi-model requests

```typescript
const r = new BatchGetRequest() 
           // BatchWriteRequest() 
           // TransactGetRequest() 
           // TransactWriteRequest()
console.log(r.params)
```

### Consumed Capacity

You might want to receive the consumed capacity which can be achieved by applying the `returnConsumedCapacity('INDEXES' | 'TOTAL')` method and the usage of `execFullResponse()` instead of `exec()`.

## BatchGet

{% embed url="https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API\_BatchGetItem.html" %}

{% code-tabs %}
{% code-tabs-item title="batch-get-request.example.ts" %}
```typescript
import { BatchGetRequest } from '@shiftcoders/dynamo-easy'

const keysToFetch: Array<Partial<ExampleModel>> = [{ id: 'my-id' }]
const otherKeysToFetch: Array<Partial<AnotherModel>> = [{ propA: 'Foo', propB: 'Bar' }]
new BatchGetRequest()
    .forModel(ExampleModel, keysToFetch)
    .forModel(AnotherModel, otherKeysToFetch)
    .exec()
    .then((result: BatchGetResponse) => {
        const itemsFetchedFromExampleTable = result['tableNameOfExampleModel']
        const itemsFetchedFromAnotherModelTable = result['tableNameOfAnotherModel']
    })
```
{% endcode-tabs-item %}
{% endcode-tabs %}

## BatchWrite

{% embed url="https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API\_BatchWriteItem.html" %}

{% code-tabs %}
{% code-tabs-item title="batch-write-request.example.ts" %}
```typescript
import { BatchWriteRequest } from '@shiftcoders/dynamo-easy'

const keysToDelete: Array<Partial<ExampleModel>> = [{ id: 'my-id' }]
const otherKeysToDelete: Array<Partial<AnotherModel>> = [{ propA: 'Foo', propB: 'Bar' }]
const objectsToPut: Array<YetAnotherModel> = [{id: 'foo', value: 'bar'}, {id: 'foo2', value: 'bar2'}]

new BatchWriteRequest()
  .returnConsumedCapacity('TOTAL')
  .delete(ExampleModel, keysToDelete)
  .delete(AnotherModel, otherKeysToDelete)
  .put(YetAnotherModel, objectsToPut)
  .execFullResponse()
  .then(resp => {
    console.log(resp.ConsumedCapacity);
  })
```
{% endcode-tabs-item %}
{% endcode-tabs %}

## TransactGet

Execute transactional read operations by providing one or multiple models + keys.

{% embed url="https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API\_TransactGetItems.html" caption="https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API\_TransactGetItems.html" %}

{% code-tabs %}
{% code-tabs-item title="transact-get-request.example.ts" %}
```typescript
import { TransactGetRequest } from '@shiftcoders/dynamo-easy'

new TransactGetRequest()
    .forModel(ExampleModel, { id: 'my-id' })
    .forModel(AnotherModel, { propA: 'Foo', propB: 'Bar' })
    .returnConsumedCapacity('TOTAL')
    .exec()
    .then(result => {
        console.log(result[0]) // ExampleModel item
        console.log(result[1]) // AnotherModel item
    })



```
{% endcode-tabs-item %}
{% endcode-tabs %}

## TransactWrite

Execute transactional write operations by providing one or multiple transact items \(TransactConditionCheck, TransactDelete, TransactPut, TransactUpdate\).

{% embed url="https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API\_TransactWriteItems.html" %}

{% code-tabs %}
{% code-tabs-item title="transact-write-request.example.ts" %}
```typescript
import { TransactWriteRequest } from '@shiftcoders/dynamo-easy'

const objectToPut: YetAnotherModel = { id: 'Foo', value: 'Bar' }

new TransactWriteRequest()
    .transact(
        new TransactConditionCheck(ExampleModel, 'check-ID').onlyIf(attribute('age').gt(18)),
        new TransactDelete(AnotherModel, 'Foo', 'Bar'),
        new TransactPut(YetAnotherModel, objectToPut),
        new TransactUpdate(ExampleModel, 'myId').updateAttribute('age').set(22),
    )
    .exec()
    .then(() => console.log('done'))
```
{% endcode-tabs-item %}
{% endcode-tabs %}

