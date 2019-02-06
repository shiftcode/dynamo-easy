---
description: >-
  The DynamoStore provides an easy way to create requests for a single model
  class.
---

# Dynamo Store

{% code-tabs %}
{% code-tabs-item title="store.example.ts" %}
```typescript
import { DynamoStore } from '@shiftcoders/dynamo-easy'

const store = new DynamoStore(ExampleModel)
```
{% endcode-tabs-item %}
{% endcode-tabs %}

simple example for consistently reading a single item:

```typescript
store.get('myPartitionKey') // returns an instance of GetRequest
    .consistentRead(true)   // sets params.ConsistentRead = true
    .exec()                 // returns a Promise
    .then((obj:ExampleModel)=>console.log(obj))
```

simple example for updating a single property with one condition:

```typescript
store.update('myPartitionKey') // returns an instance of UpdateRequest
    .updateAttribute('myPropInExampleModel').set('myNewValue')
    .onlyIfAttribute('anotherPropInExampleModel').equals('aValue')
    .exec()
```

