---
description: SingleModel-Requests you can create directly from DynamoStore.
---

# Model Requests

## Put

{% embed url="https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API\_PutItem.html" %}

{% tabs %}
{% tab title="Simple" %}
```typescript
const myObjectToWrite = {id:'myId', propA: 42, propB: ['foo', 'bar']}
await store.put(myObjectToWrite)
    .ifNotExists()
    .exec() 
```
{% endtab %}

{% tab title="Complex" %}

{% endtab %}
{% endtabs %}

## Get

{% embed url="https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API\_GetItem.html" %}

## Update

{% embed url="https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API\_UpdateItem.html" caption="https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API\_UpdateItem.html" %}

{% tabs %}
{% tab title="Simple" %}
```typescript

await store.update('myPartitionKey', 'mySortKey')
    .updateAttribute('propertyA').set('newValue')
    .onlyIfAttribute('otherProp').equals('aValue')
    .exec()
```
{% endtab %}

{% tab title="Complex" %}
```typescript

const index = 3
const oneHouerAgo = new Date(Date.now() - 1000 * 60 * 60)

await store.update('myPartitionKey', 'mySortKey')
    .operations(
        update(`myNestedList[${index}].propertyX`).set('value'),
        update('updated').set(new Date())
    )
    .onlyIf(
        or(
            attribute('id').attributeNotExists(), // item not existing
            attribute('updated').lt(oneHouerAgo), // or was not updated in the last hour
    )
    .exec()
```
{% endtab %}
{% endtabs %}

## Delete

{% embed url="https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API\_DeleteItem.html" %}

## Query

{% embed url="https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API\_Query.html" %}

## Scan

{% embed url="https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API\_Scan.html" %}

## BatchGet

This is a special implementation from BatchGetRequest which only allows to read from a single table

## BatchWrite

This is a special implementation from BatchWriteRequest which only allows to write to a single table

## TransactGet

This is a special implementation from TransactGetRequest which only allows to read from a single table





