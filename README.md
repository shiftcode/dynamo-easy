# Dynamo-Easy
[![Travis](https://img.shields.io/travis/com/shiftcode/dynamo-easy.svg)](https://travis-ci.com/shiftcode/dynamo-easy)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![latest-release](https://img.shields.io/npm/v/@shiftcoders/dynamo-easy/latest.svg)]()
[![Coverage Status](https://coveralls.io/repos/github/shiftcode/dynamo-easy/badge.svg?branch=master)](https://coveralls.io/github/shiftcode/dynamo-easy?branch=master)
[![Dev Dependencies](https://img.shields.io/david/expressjs/express.svg)](https://david-dm.org/michaelwittwer/dynamo-easy?type=dev)
[![Greenkeeper badge](https://badges.greenkeeper.io/alexjoverm/typescript-library-starter.svg)](https://greenkeeper.io/)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![All Contributors](https://img.shields.io/badge/all_contributors-3-orange.svg)](#contributors)

Abstracts away the complexity of the low level aws dynamosdk. Provides an easy to use fluent api to for requests and supports typescript decorators,
to define some metadata for your models. You don't need to care about the mapping of javascript types to their dynamo types any more. We got you covered.

Checkout the full technical api documentation [here](https://shiftcode.github.io/dynamo-easy/).

Built with :heart: by [shiftcode](https://www.shiftcode.ch).

# Get Started

## Prerequisite

### Typescript Metadata

#### Reflection API

> ⚠ The reflect-metadata polyfill should be imported only once in your entire application because the Reflect object is 
mean to be a global singleton.

Install the reflect-metadata polyfill.

```
npm install reflect-metadata --save
```

The type definitions for reflect-metadata are included in the npm package. 
You need to add the following reference to the types field in your [tsconfig.json](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html#types-typeroots-and-types):

```
"types": ["reflect-metadata"]
```

Finally, import reflect-metadata in some entry file in your application.

```
import "reflect-metadata"
```

#### Decorators


We need to enable the two experimental features to work with decorators, add this to your tsconfig.json:

```
"experimentalDecorators": true
"emitDecoratorMetadata": true
```

#### Other
Also make sure to install the other peer dependencies of @shiftcoders/dynamo-easy.


## First Sample

When all the setup work is done, define your first model and create a dynamo store to execute actions on the dynamoDB.

```typescript
@Model()
class Person{
  @PartitionKeyUUID() 
  id: string
  
  name: string
}

const dynamoStore = new DynamoStore(Person)

// add a new item
dynamoStore.put({name: 'peter'})
  .exec().subscribe(()=>{
    console.log('peter was saved')
  })

// search for all persons which start with the character 'p'
dynamoStore.query()
  .where('name').startsWith('p')
  .exec()
  .subscribe((persons: Person[])=>{
    console.log('got persons')
  })
  
  
// returns all persons
dynamoStore.scan()
  .exec()
  .subscribe((persons: Person[]) => {
    console.log('all persons')
  })

```

# Decorators
Decorators are used to add some metadata to our model classes, relevant to our javascript-to-dynamo mapper.

Additionally we rely on the reflect-metadata (https://www.npmjs.com/package/reflect-metadata) library for reflection api.

To get started with decorators just add a [@Model()](https://shiftcode.github.io/dynamo-easy/modules/_decorator_impl_model_model_decorator_.html) Decorator to any typescript class. 

If you need to read the metadata by hand for some purpose, use the [MetadataHelper](https://shiftcode.github.io/dynamo-easy/classes/_decorator_metadata_metadata_helper_.metadatahelper.html) to read the informations.

We make heavy usage of compile time informations about our models and the property types.
Here is a list of the types that can be retrieved from compile time information for the key design:type. (The metadata will only be added if at least one decorator is
present on a property)

- String
- Number
- Boolean
- Array (no generics)
- Custom Types
- ES6 types like Set, Map will be mapped to Object when calling for the type via Reflect.get(design:type), so we need some extra info.

Generic information is never available due to some serialization limitations at the time of writing.

## Model

### Custom TableName
Here is the rule how a table name is built `${kebabCase(modelName)}s` so for a model called Product the table will be named products, this is a default implementation.

There are two possibilities to change the name:

- override the name using the tableName parameter @Model({tableName: tableName})
- provide a TableNameResolver function when instantiating a DynamoStore. This method will receive the default table name 
  (either resolved using the model name or custom value when a tableName was provided in @Model decorator)

# Mapper

## Types

We do the mapping from javascript objects to dynamodb types for you in requests and responses

Simple Type (no decorators required to work)
- String
- Number
- Boolean
- Null
- Array
- String/Number Enum

Complex Types (properties with these types need some decorators to work properly)
- Set<simpleType | complexType>
- Map
- Array<complexType>

| TS Type       | Dynamo Type   |
| ------------- |:-------------:|
| String        | S             |
| Number        | N             |
| Boolean       | BOOL          |
| null          | NULL          |
| Array         | L, (S,N,B)S   |
| ES6 Set       | L, (S,N,B)S   |
| Object       | M   |
|---|---|
| Binary        | Not Supported |
| ES6 Map       | Not Supported   |
| Date          | Not Supported |

## Custom Attribute Mapping
It is always possible to define a custom mapping strategy, 
just implement the [MapperForType](https://shiftcode.github.io/dynamo-easy/interfaces/_mapper_for_type_base_mapper_.mapperfortype.html) and provide with the CustomMapper directive.

## Collection Mapping (Array & Set)

### Array
Javascript Arrays with a items of type String, Number or Binary will be mapped to a S(et) type, by default all other types are mapped to L(ist) type.
If the items have a complex type it will be mapped to a L(ist).

### Set
An instance of ES6 Set type will be mapped to a S(et) type if the type of the items is supported (String, Number, Binary), otherwise it is mapped to a L(ist).  

When one of the following decorators is present, the value is always mapped to a L(ist).

- @SortedSet(itemType?: ModelClazz) - only L(ist) type preserves order
- @TypedSet(itemType?: ModelClazz) - if the itemType is not one of String | Number | Binary
- @TypedArray()

## Date
We only support the native Date type and you need to explicitly mark a property to be a Date by using the @Date() decorator\
(which is basically just syntactic sugar for @CustomMapper(TheDateMapper)).\
If you want to use a different type for the @Date decorator (eg. Moment) you need to define a custom mapper and provide it to the dynamo easy config like this:\
`updateDynamoEasyConfig({ dateMapper: MomentMapper })`


A mapper for moment dates could look like this:
```typescript
import * as moment from 'moment'
import { MapperForType, StringAttribute } from '@shiftcoders/dynamo-easy'

export const MomentMapper: MapperForType<moment.Moment, StringAttribute> = {

  fromDb: (value: StringAttribute) => {
    const parsed = moment(value.S, moment.ISO_8601)
    if (!parsed.isValid()) {
      throw new Error(`the value ${value} cannot be parsed into a valid moment date`)
    }
    return parsed
  },

  toDb: (value: moment.Moment) => {
    if (!moment.isMoment(value)) {
      throw new Error(`the value ${value} is not of type moment`)
    }
    if (!value.isValid()) {
      throw new Error(`cannot map property value ${value}, because it is not a valid moment date`)
    }
    return { S: value.clone().utc().format() }
  },
}
```


## Enum
Enum values are persisted as Numbers (index of enum or assigned value) or string if string value was assigned.

# Request API
To start making requests create an instance of [DynamoStore](https://shiftcode.github.io/dynamo-easy/classes/_dynamo_dynamo_store_.dynamostore.html) and execute the desired operation using the provided api.
We support the following dynamodb operations with a fluent api:

- Put
- Get
- Update
- Delete
- Scan
- Query
- BatchGet (from a single table)
- BatchWrite (to a single table)
- MakeRequest (generic low level method for special scenarios)

There is always the possibility to access the Params object directly to add values which are not covered with our api.

## non table tied requests
Currently two type of requests exists which are not tied to one table/model and therefore are not created from a DynamoStore instance.

### BatchGet

There are two scenarios for a batch get item request. One is requesting multiple items from one table by id and the other is requesting multiple items by id from multiple
tables. The first scenario is support using DynamoStore.batchGet() the second one can be achieved by using the [BatchGetRequest](https://shiftcode.github.io/dynamo-easy/classes/_dynamo_batchget_batch_get_request_.batchgetrequest.html) class.

```typescript
  import { BatchGetRequest } from '@shiftcoders/dynamo-easy'
  new BatchGetRequest()
      // table with simple primary key
    .forModel(YourModelWithPartitionKey, [{ id: 'myId' }], /* consistentRead */ true)
    // table with composite primary key (sortkey is optional)
    .forModel(YourModelWithCompositeKey, [{ id: 'myId', creationDate: new Date('2018-01-01') }])
    .exec().subscribe(response => {
       // an object where the items are mapped to the table name 
     })
```
### TransactWriteRequest
Create transactions for all-or-nothing operations with [TransactWriteRequest](https://shiftcode.github.io/dynamo-easy/classes/_dynamo_transactwrite_transact_write_request_.transactwriterequest.html) across one or more tables.
The different operations are:
* [TransactConditionCheck](https://shiftcode.github.io/dynamo-easy/classes/_dynamo_transactwrite_transact_condition_check_.transactconditioncheck.html)
* [TransactPut](https://shiftcode.github.io/dynamo-easy/classes/_dynamo_transactwrite_transact_put_.transactput.html)
* [TransactDelete](https://shiftcode.github.io/dynamo-easy/classes/_dynamo_transactwrite_transact_delete_.transactdelete.html)
* [TransactUpdate](https://shiftcode.github.io/dynamo-easy/classes/_dynamo_transactwrite_transact_update_.transactupdate.html)

The transaction operations can optionally check for prerequisite conditions that must be satisfied before making updates. 
For conditions not involving a an item to write on, use the TransactConditionCheck.

```typescript
  import { TransactWriteRequest, TransactConditionCheck, TransactDelete, TransactPut, attribute } from '@shiftcoders/dynamo-easy'
  
  new TransactWriteRequest()
    .transact(
      new TransactConditionCheck(YourModelWithPartitionKey, 'check-ID').onlyIf(attribute('age').gt(18)),
      new TransactDelete(YourModelWithCompositeKey, 'the-partition-key', 'the-sort-key'),
      new TransactPut(YourCustomModel, { id: 'put-ID-1', age: 21 }).ifNotExists(),
    )
    .returnItemCollectionMetrics('SIZE')
    .returnConsumedCapacity('TOTAL')
    .execFullResponse()
    .subscribe(resp => {
      console.log(resp.ItemCollectionMetrics)
      console.log(resp.ConsumedCapacity)
    })
```

# Authentication
In a real world scenario you'll have some kind of authentication to protect your dynamodb ressources. You can customize on how to authenticate when providing a custom
SessionValidityEnsurer function to the DynamoStore when creating a new instance.
The default implementation is a no-op function.

## Session Validity Ensurer
Here is an example of an implementation using amazon cognito

```typescript
function sessionValidityEnsurer(): Observable<boolean> {
  return Observable.of(this.isLoggedIn())
    .switchMap(isLoggedIn => {
       if (isLoggedIn) {
          this.logger.debug('withValidSession :: cognitoService.isLoggedIn() -> we have a valid session -> proceed')
          return Observable.of(true)
        } else {
          this.logger.debug(metadata)
          return this.getUser()
            .catch((err, caught): Observable<boolean> => {
              this.logger.error('withValidSession :: there was an error when refreshing the session', err)
              throw new AuthError('SC_UNAUTHENTICATED', 'Could not refresh the token' + JSON.stringify(err))
            })
            .do(user => this.logger.debug('withValidSession :: we got new valid session', user))
        }
      })
      .map((value: boolean | CognitoUser) => {
        return
      })
  }
```

## Expressions ([AWS Doc](http://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.html))
By default we create a substitution placeholder for all the attributes, just to not implement a [blacklist](http://docs.aws.amazon.com/amazondynamodb/latest/developerguide/ReservedWords.html) with reserved words in the context of aws dynamodb.

attributename: age

```typescript
expression: '#age = :age' 
attributeExpressionNames: {'#age': 'age'}
attributeExpressionValues: {':age': {N: '10'}}
```

this works seemlesly for top level attribtues, but if we wanna build an expression for where the attribute needs to be accessed with a document path, we need some special logic
nested attribute: person.age

```typescript
attributeExpressionNames: {'#person': 'person', '#age': 'age'}
attributeExpressionValues: {':age': {N: '10'}}
expression: '#person.#age = :age'
```

we can't use #personAge as a placeholder for 'person.age' because if the dot is part of an attribute name it is not treated as a metacharacter compared to when using directly in expression, so
the above solution needs to be used

these are the accessor rules for nested attribute types
- [n] — for list elements
- . (dot) — for map elements

# Development

## NPM scripts
 - `npm t`: Run test suite
 - `npm start`: Runs `npm run build` in watch mode
 - `npm run test:watch`: Run test suite in [interactive watch mode](http://facebook.github.io/jest/docs/cli.html#watch)
 - `npm run test:prod`: Run linting and generate coverage
 - `npm run build`: Generage bundles and typings, create docs
 - `npm run lint`: Lints code
 - `npm run commit`: Commit using conventional commit style ([husky](https://github.com/typicode/husky) will tell you to use it if you haven't :wink:)

## Automatic releases
Use the npm comand `npm run commity`, which is a convenient way to create conventional commits. Those messages are used to run [semantic releases](https://github.com/semantic-release/semantic-release),
which publishes our code automatically on github and npm, plus generates automatically a changelog. This setup is highly influenced by [Kent C. Dodds course on egghead.io](https://egghead.io/courses/how-to-write-an-open-source-javascript-library)

## Git Hooks
We use 2 git hooks:

`precommit`
- to format the code with Prettier :nail_care:
- to check if the commit message follows a [conventional commit message](https://github.com/conventional-changelog/conventional-changelog)

`prepush`
- to check if the code can be built running `npm run build`
- to check if all tests pass

## Credits
- [https://github.com/alexjoverm/typescript-library-starter](https://github.com/alexjoverm/typescript-library-starter) For the awesome project which helps to scaffold, develop and build a typescript library project
- [https://github.com/ryanfitz/vogels](https://github.com/ryanfitz/vogels) - To get an idea on how to build the chainable api
- [http://densebrain.github.io/typestore/](http://densebrain.github.io/typestore/) - Thats where the base idea on how to implement the model decorators came came from

## Contributors
Made with :heart: by [@michaelwittwer](https://github.com/michaelwittwer) and all these wonderful contributors ([emoji key](https://github.com/kentcdodds/all-contributors#emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
| [<img src="https://avatars1.githubusercontent.com/u/8394182?v=4" width="100px;"/><br /><sub>Michael Wittwer</sub>](https://www.shiftcode.ch)<br />[💻](https://github.com/shiftcode/dynamo-easy/commits?author=michaelwittwer "Code") [📖](https://github.com/shiftcode/dynamo-easy/commits?author=michaelwittwer "Documentation") [⚠️](https://github.com/shiftcode/dynamo-easy/commits?author=michaelwittwer "Tests") | [<img src="https://avatars2.githubusercontent.com/u/8321523?s=460&v=4" width="100px;"/><br /><sub>Michael Lieberherr</sub>](https://www.shiftcode.ch)<br />[💻](https://github.com/shiftcode/dynamo-easy/commits?author=michaellieberherrr "Code") [📖](https://github.com/shiftcode/dynamo-easy/commits?author=michaellieberherrr "Documentation") [⚠️](https://github.com/shiftcode/dynamo-easy/commits?author=michaellieberherrr "Tests") | [<img src="https://avatars3.githubusercontent.com/u/37636934?s=460&v=4" width="100px;"/><br /><sub>Simon Mumenthaler</sub>](https://www.shiftcode.ch)<br />[💻](https://github.com/shiftcode/dynamo-easy/commits?author=simonmumenthaler "Code") [📖](https://github.com/shiftcode/dynamo-easy/commits?author=simonmumenthaler "Documentation") [⚠️](https://github.com/shiftcode/dynamo-easy/commits?author=simonmumenthaler "Tests") |
| :---: | :---:| :---: |
<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/kentcdodds/all-contributors) specification. Contributions of any kind welcome!
