---
description: >-
  Decorators are used to add some metadata to our model classes, relevant to our
  javascript-to-dynamo mapper.
---

# Decorators

We rely on the reflect-metadata \([https://www.npmjs.com/package/reflect-metadata](https://www.npmjs.com/package/reflect-metadata)\) library for reflection api.

To get started with decorators just add a [@Model\(\)](https://shiftcode.github.io/dynamo-easy/modules/_decorator_impl_model_model_decorator_.html) Decorator to any typescript class.

If you need to read the metadata by hand for some purpose, use the [MetadataHelper](https://shiftcode.github.io/dynamo-easy/classes/_decorator_metadata_metadata_helper_.metadatahelper.html) to read the informations.

We make heavy usage of compile time informations about our models and the property types. Here is a list of the types that can be retrieved from compile time information for the key `design:type`. \(The metadata will only be added if at least one decorator is present on a property\)

* String
* Number
* Boolean
* Array \(no generics\)
* Custom Types
* ES6 types like Set, Map will be mapped to Object when calling for the type via Reflect.get\(design:type\), so we need some extra info.

Generic information is never available due to some serialization limitations at the time of writing.

## Model Decorators

### @Model

Use the `@Model` decorator to make it 'mappable' for the dynamo-easy mapper.  
You can optionally pass an object containing the table name if you don't want the default table name.  
The default table name is built with `${kebabCase(modelName)}s`

```typescript
import { Model } from '@shiftcoders/dynamo-easy'

@Model({tableName: 'my-model-table'}) 
class MyModel {
}
```

{% hint style="info" %}
To use different table names on different stages the [tableNameResolver](../dynamo-easy-config/configuration.md#tablenameresolver) is the right choice.
{% endhint %}

## Key Decorators

### Primary Key

* `PartitionKey`
* `SortKey`

```typescript
import { Model, PartitionKey, SortKey } from '@shiftcoders/dynamo-easy'

@Model()
class MyModel {
    @PartitionKey()
    myPartitionKey: string
    
    @SortKey()
    mySortKey: number
}
```

### Global Secondary Index

We provide two decorators to work with global secondary indexes:

* `GSIPartitionKey`
* `GSISortKey`

{% hint style="info" %}
You can use multiple GSI on the same model and also use the same property for different Indexes
{% endhint %}

```typescript
import { Model, GSIPartitionKey, GSISortKey } from '@shiftcoders/dynamo-easy'

@Model()
class MyModel {
    @GSIPartitionKey('NameOfIndex')
    myGsiPartitionKey: string
    
    @GSISortKey('NameOfIndex')
    myGsiSortKey: number
}
```

### Local Secondary Index

```typescript
import { Model, LSISortKey, PartitionKey, SortKey } from '@shiftcoders/dynamo-easy'

@Model()
class MyModel {
    @PartitionKey()
    myPartitionKey: string
    
    @SortKey()
    mySortKey: number
    
    @LSISortKey()
    myLsiSortKey: number
}
```

## Type Decorators

### @CollectionProperty\(options\)

The CollectionProperty decorator is used for arrays and sets. It defines if the values should be mapped to \[L\]ist or \[\(N\|S\|B\)S\]et and stores the information how the Attributes should be parsed.

#### options

`itemType: ModelConstructor` provide the class of the items inside the collection if they have decorators \(this ItemClass also needs the `@Model` decorator\)

`itemMapper: MapperForType` provide a custom mapper to map the complex items of your collection to \[S\]tring, \[N\]umber or \[B\]inary. This is mainly useful if you want to store them in a \[S\]et. 

`sorted: boolean` the collection will be stored as \[L\]ist \(\[S\]et does not preserve the order\) no matter if the javascript type is a `Set` or an `Array` .

`name: string` define a different name \(than the property name\) for DynamoDB.

{% hint style="info" %}
it does no make sense to provide both, the itemType and an itemMapper. An Error would be thrown.
{% endhint %}

> further information how arrays and sets are mapped:

{% page-ref page="mapping-concept.md" %}

### @Property\(options\)

`name: string` define a different name \(than the property name\) for DynamoDB.

`mapper: MapperForType` define a custom mapper \(e.g if you want to use a complex object as PartitionKey or SortKey\)

### @DateProperty\(\)

The DateProperty decorator is just syntactic sugar for `@Property({mapper: dateMapper})`  
all properties decorated with it will be mapped with the default dateMapper or the one you define with `updateDynamoEasyConfig({dateMapper:})`.

## Other

### @Transient

The `@Transient` decorator can be used to ignore a property when the object is mapped.

```typescript
import { Model, Transient } from '@shiftcoders/dynamo-easy'

@Model()
class MyModel {
    @Transient()
    myPropertyToIgnore: any
}
```







