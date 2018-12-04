# Dynamo-Easy
[![Travis](https://img.shields.io/travis/com/shiftcode/dynamo-easy.svg)](https://travis-ci.com/shiftcode/dynamo-easy)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![latest-release](https://img.shields.io/npm/v/@shiftcoders/dynamo-easy/latest.svg)]()
[![Coverage Status](https://coveralls.io/repos/github/shiftcode/dynamo-easy/badge.svg?branch=master)](https://coveralls.io/github/shiftcode/dynamo-easy?branch=master)
[![Dev Dependencies](https://img.shields.io/david/expressjs/express.svg)](https://david-dm.org/michaelwittwer/dynamo-easy?type=dev)
[![Greenkeeper badge](https://badges.greenkeeper.io/alexjoverm/typescript-library-starter.svg)](https://greenkeeper.io/)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![All Contributors](https://img.shields.io/badge/all_contributors-3-orange.svg)](#contributors)



Provides an easy to use fluent api to send request to DynamoDB. Abstracts away the complexity of the low level aws dynamo-sdk. 
Uses typescript decorators to declare the models and will take care of the mapping between js types to their dynamo types.
  
TODO link
Checkout the full technical api documentation [here](https://dynamo-easy.shiftcode.io).

Built with :heart: by [shiftcode](https://www.shiftcode.ch).

## Goals / Non-Goals

Goals
- Decorators to declare models and metadata for properties
- Api Support for the 

Non-Goals
- Api to manage dynamoDb (create table, update capacity, etc.)

## Installation

```
npm i @shiftcoders/dynamo-easy --save
npm i aws-sdk@^2.286.1 lodash@^4.17.10 rxjs@^6.0.0 uuid@^3.3.2  --save
npm i reflect-metadata@^0.1.12 --save
```

> ⚠ The reflect-metadata polyfill should be imported only once in your entire application because the Reflect object is 
mean to be a global singleton. Import it in some entry file of your application, like polyfill.ts or similar.

```
app.ts (or some other entry file)

import "reflect-metadata"
```

The type definitions for reflect-metadata are included in the npm package. Only required if you use reflect-metadata in your project.
You need to add the following reference to the types field in your [tsconfig.json](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html#types-typeroots-and-types):

```
"types": ["reflect-metadata"]
```

We need to enable the two experimental features to work with decorators, add this to your tsconfig.json:

```
"experimentalDecorators": true
"emitDecoratorMetadata": true
```

## Quick Start

Define your first model:

```typescript
@Model()
class Person{
  @PartitionKey() 
  id: string
  
  name: string
}
```

and create a dynamo store to execute actions on the dynamoDB.

```typescript
const dynamoStore = new DynamoStore(Person)

// add a new item
dynamoStore.put({id: 'wernervogels', name: 'Werner Hans Peter Vogels'})
  .exec()
  .subscribe(() => {
    console.log('saved person')
  })

// search for a single person by known id
dynamoStore.query()
  .wherePartitionKey('wernervogels')
  .execSingle()
  .subscribe((person: Person) => {
    console.log('got person', person)
  })
  
  
// returns all persons where the name starts with w
dynamoStore.scan()
  .whereAttribute('name').beginsWith('w')
  .exec()
  .subscribe((persons: Person[]) => {
    console.log('all persons', persons)
  })
```

Checkout our sample (TODO link to glitch) where more use-cases are covered. 

# Config
The global configuration must be manipulated before any model class is loaded, because . Check the [doc](TODO) for possible configuration.

# Decorators
Decorators are used to add some metadata to our model classes, relevant to our javascript-to-dynamo mapper.

To get started with decorators just add a [@Model()](TODO - https://shiftcode.github.io/dynamo-easy/modules/_decorator_impl_model_model_decorator_.html) Decorator to any typescript class. 

TODO update link
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

Generic information is never available due to some serialization limitations of typescript at the time of writing.

## Model

### Custom TableName
Here is the rule how a table name is built `${kebabCase(modelName)}s` so for a model called Product the table will be named products, this is the default implementation.

There are two possibilities to change the name:

- override the name using the tableName parameter @Model({tableName: tableName})
- provide a TableNameResolver function when instantiating a DynamoStore. This method will receive the default table name 
  (either resolved using the model name or custom value when a tableName was provided in @Model decorator)

# Mapper

## Types

We do the mapping from javascript objects to dynamodb json for you. The dynamodb api only understands json in a special format.

Here is a sample of a string mapped to dynamodb json: 

```
# javascript string
const name = 'sample'

# dynamodb json
const dynamodbJson = {S: "sample"}
```

Simple Type (no property decorators required)
- String
- Number
- Boolean
- Null
- Array
- String/Number Enum

Complex Types (decorators required)
- Set<simpleType | complexType>
- Map
- Array<complexType>

| Javascript Type       | Dynamo Type   |
| ------------- |:-------------:|
| String        | S             |
| Number        | N             |
| Boolean       | BOOL          |
| null          | NULL          |
| Array         | L, (S,N,B)S   |
| ES6 Set       | L, (S,N,B)S   |
| Object       | M   |
| Date          | N (unix timestamp) |
|---|---|
| Binary        | Not Supported |
| ES6 Map       | Not Supported   |

## Custom Mapper
It is always possible to define a custom mapping strategy, 
just provide a Mapper of type [MapperForType](TODO - https://shiftcode.github.io/dynamo-easy/interfaces/_mapper_for_type_base_mapper_.mapperfortype.html) and provide with the CustomMapper directive.


```typescript
interface Detail{
  name: string
  email: string
}

function toDb(modelValue: Detail){
  return `${modelValue.name}_${modelValue.email}`
}

function fromDb(attributeValue: StringAttribute): Detail {
  const detailValues = attributeValue.S.split('_')
  return {
    name: detailValues[0],
     email: detailValues[1]
  }
}

const DetailMapper: MapperForType<Detail, StringAttribute> = {
  toDb,
  fromDb
}

@Model()
class Model{
  @PartitionKey()
  id: string

  @CustomMapper(DetailMapper)
  details: Detail
}
```

## Collection Mapping (Array & Set)

### Array
Homogeneous javascript arrays with items of type String, Number or Binary will be mapped to a S(et) type, by default all other types are mapped to L(ist) type.
If the items have a non-primitive type it will be mapped to a L(ist).

### Set
An instance of ES6 Set type will be mapped to a S(et) type if the type of the item is supported (String, Number, Binary), otherwise it is mapped to a L(ist).  

When one of the following decorators is present, the value is always mapped to a L(ist).

- @SortedSet(itemType?: ModelConstructor) - only L(ist) type preserves order
- @TypedSet(itemType?: ModelConstructor) - if the itemType is none one of String | Number | Binary
- @TypedArray()

## Date
We only support the native Date type and you need to explicitly mark a property to be a Date by using the @DateProperty() decorator\
(which is basically just syntactic sugar for @CustomMapper(TheDateMapper)).\
We provide two mappers:
- Unix Timestamp (default)
- UTC ISO Timestamp

If you want to use a different type for the @Date decorator (eg. Moment) you need to define a custom mapper and provide it to the dynamo easy config like this:\
`updateDynamoEasyConfig({ dateMapper: MomentMapper })`\

A mapper for moment dates could look like this:
```typescript
import * as moment from 'moment'
import { MapperForType, StringAttribute } from '@shiftcoders/dynamo-easy'

function fromDb(value: StringAttribute){
  const parsed = moment(value.S, moment.ISO_8601)
  if (!parsed.isValid()) {
    throw new Error(`the value ${value} cannot be parsed into a valid moment date`)
  }
  return parsed
},

function toDb(value: moment.Moment){
  if (!moment.isMoment(value)) {
    throw new Error(`the value ${value} is not of type moment`)
  }
  if (!value.isValid()) {
    throw new Error(`cannot map property value ${value}, because it is not a valid moment date`)
  }
  return { S: value.clone().utc().format() }
}

export const MomentMapper: MapperForType<moment.Moment, StringAttribute> = {
  fromDb,
  toDb
}
```

## Enum
Enum values are persisted as Numbers (index of enum) or string if string value was given.

# Request API
To start making requests create an instance of [DynamoStore](TODO - https://shiftcode.github.io/dynamo-easy/classes/_dynamo_dynamo_store_.dynamostore.html) and execute the desired operation using the provided api.
We support the following dynamodb operations with a fluent api:

- TODO - TransactionPut
- BatchGet (from a single table)
- BatchWrite (to a single table)
- Delete
- Get
- Put
- Query
- Scan
- Update
- MakeRequest (generic low level method for special scenarios)

There is always the possibility to access the Params object directly to add values which are not covered with our api.

# Authentication
In a real world scenario you'll have some kind of authentication to protect your dynamodb resources. You can customize on how to authenticate when providing a custom
SessionValidityEnsurer function to the global configuration.
The default implementation is a no-op function.

## Session Validity Ensurer
Here is an example of an implementation using amazon cognito

```typescript
function sessionValidityEnsurer(): Observable<boolean> {
  return of(this.isLoggedIn()).pipe(
    switchMap(isLoggedIn => {
       if (isLoggedIn) {
          this.logger.debug('withValidSession :: cognitoService.isLoggedIn() -> we have a valid session -> proceed')
          return of(true)
        } else {
          this.logger.debug(metadata)
          return this.getUser()
            .catch((err, caught): Observable<boolean> => {
              this.logger.error('withValidSession :: there was an error when refreshing the session', err)
              throw new AuthError('SC_UNAUTHENTICATED', 'Could not refresh the token' + JSON.stringify(err))
            })
            .do(user => this.logger.debug('withValidSession :: we got new valid session', user))
        }
      }),
      map((value: boolean | CognitoUser) => {
        return
      })
    )
  }
```

## Expressions ([AWS Doc](http://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.html))
By default we create a substitution placeholder for all the attributes (stored in AttributeExpressionNames), just to not implement a [blacklist](http://docs.aws.amazon.com/amazondynamodb/latest/developerguide/ReservedWords.html) with reserved words in the context of aws dynamodb.

attributename: age

```typescript
expression: '#age = :age' 
attributeExpressionNames: {'#age': 'age'}
attributeExpressionValues: {':age': {N: '10'}}
```

this works seemlesly for top level attributes but if we wanna build an expression for where the attribute needs to be accessed with a document path, we need some special logic

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

# Logging
We will log on different log levels. By default none of the log outputs is visible. You can provide your own log provider.

```typescript
const consoleLogReceiver: LogReceiver = (logInfo: LogInfo) => {
  console.log(logInfo)
}

updateDynamoEasyConfig({ logReceiver: consoleLogReceiver })

```


# Development

## Automatic releases
We use [semantic releases](https://github.com/semantic-release/semantic-release) to release dynamo-easy.

Use the npm command `npm run commity`, which is a convenient way to create conventional commits using cli. 

## Git Hooks
We use git hooks to maintain code style & quality:

`commit-msg`
- makes sure the commit message follows [conventional commit message](https://github.com/conventional-changelog/conventional-changelog)

`pre-commit`
- to format the code with Prettier :nail_care:
- and sort package.json entries A -> Z

`pre-push`
- run tests
- to check if the code can be compiled running `npm run build`

## Credits
- [https://github.com/alexjoverm/typescript-library-starter](https://github.com/alexjoverm/typescript-library-starter) For the awesome project which helps to scaffold, develop and build a typescript library project
- [https://github.com/ryanfitz/vogels](https://github.com/ryanfitz/vogels) - To get an idea on how to build the chainable api
- [http://densebrain.github.io/typestore/](http://densebrain.github.io/typestore/) - Thats where the base idea on how to implement the model decorators came came from

## Contributors
Made with :heart: by [@michaelwittwer](https://github.com/michaelwittwer) and all these wonderful contributors ([emoji key](https://github.com/kentcdodds/all-contributors#emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
| [<img src="https://avatars1.githubusercontent.com/u/8394182?v=4" width="100px;"/><br /><sub>Michael Wittwer</sub>](https://www.shiftcode.ch)<br />[💻](https://github.com/shiftcode/dynamo-easy/commits?author=michaelwittwer "Code") [📖](https://github.com/shiftcode/dynamo-easy/commits?author=michaelwittwer "Documentation") [⚠️](https://github.com/shiftcode/dynamo-easy/commits?author=michaelwittwer "Tests") | [<img src="https://avatars2.githubusercontent.com/u/8321523?s=460&v=4" width="100px;"/><br /><sub>Michael Lieberherr</sub>](https://www.shiftcode.ch)<br />[💻](https://github.com/shiftcode/dynamo-easy/commits?author=michaellieberherrr "Code") [📖](https://github.com/shiftcode/dynamo-easy/commits?author=michaellieberherrr "Documentation") [⚠️](https://github.com/shiftcode/dynamo-easy/commits?author=michaellieberherrr "Tests") | [<img src="https://avatars3.githubusercontent.com/u/37636934?s=460&v=4" width="100px;"/><br /><sub>Simon Mumenthaler</sub>](https://www.shiftcode.ch)<br />[💻](https://github.com/shiftcode/dynamo-easy/commits?author=simonmumenthaler "Code") [⚠️](https://github.com/shiftcode/dynamo-easy/commits?author=simonmumenthaler "Tests") |
| :---: | :---:| :---: |
<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/kentcdodds/all-contributors) specification. Contributions of any kind welcome!
