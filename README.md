# sc-dynamodb

[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![Greenkeeper badge](https://badges.greenkeeper.io/alexjoverm/typescript-library-starter.svg)](https://greenkeeper.io/)
[![Travis](https://img.shields.io/travis/michaelwittwer/dynamo-easy.svg)](https://travis-ci.org/michaelwittwer/dynamo-easy)
[![Coveralls](https://img.shields.io/coveralls/michaelwittwer/dynamo-easy.svg)](https://coveralls.io/github/michaelwittwer/dynamo-easy)
[![Dev Dependencies](https://david-dm.org/michaelwittwer/dynamo-easy/dev-status.svg)](https://david-dm.org/michaelwittwer/dynamo-easy?type=dev)

sc stands for [https://www.shiftcode.ch](shiftcode) that's the company which supports this project.

## Purpose

The official Amazon Dynamo SDK for javascript has a pretty low level api, where some deeper knowledge about all the possible options is required.
There is also the Dynamo-Document client which also supports the mapping of Javascript objects to DynamoDb attributes, but not at the depth we need.
This Library provides an easy to use descriptive chainable api to execute dynamoDb requests. This library also takes care of the mapping of Typescript
Models into DnymoDb attribute values. From simple types like String, Number, Boolean, Binary to more complex types like custom classes, momentJs Dates.

# What this library does not provide
API to setup tables (we use cloudformation on our side for infrastructur setup, so this was not a need for us)


# Thanks goes out to
[https://github.com/alexjoverm/typescript-library-starter](https://github.com/alexjoverm/typescript-library-starter) For the awesome project which helps to scaffold, develop and build a typescript library project
[https://github.com/ryanfitz/vogels](https://github.com/ryanfitz/vogels) - To get an idea on how to build the chainable api
[http://densebrain.github.io/typestore/](http://densebrain.github.io/typestore/) - Thats where the base idea on how to implement the model decorators came came from 
 

# Get Started

Usage it with Angular (>4) checkout our angular-service. [TODO](TODO)

Basic Example:
```
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

# Authentication

# Customization

## Table Names

## Session Validity Ensurer

# Request API

The request api has support for the following operations:

- Put
- Get
- Update
- Delete
- Scan
- Query
- MakeRequest (generic low level method for special scenarios)

For most of the api there is probably no explanation required, here are some topics we think
need some more info.

There is always the possibility to access the Params object directly to add values which are not covered with our api.

### Expressions ([http://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.html](Official Doc))

When working with expressions there is an important point to remember, an expression looks like (Scan Filter Expression):

```
{
  FilterExpression: '#name = :name'
  ExpressionAttributeNames: {'#name': 'name'}
  ExpressionAttributeValues: {':name': {S: 'peter'}}
}
```

The usage of ExpressionAttributeNames is not required, but due to the fact that there are a lot of keywords which could not be used in an expression (blacklist)[http://docs.aws.amazon.com/amazondynamodb/latest/developerguide/ReservedWords.html],
we replace the attribute names always with a variable (starting with the '#' sign)

## Put

## Scan

## Query

## Delete

## Update

## Pagination 


# Decorators

# Fluent API 

## DynamoDB Request abstraction

We provide an abstraction on top of the aws-sdk to execute requests.  The fluent api should be self-explanatory always with the ability to access the underlaying
plain request params to be very flexible. (If new api parameters are not implemented by the library yet, we can still use it).

### Primary Key

To be clear about the used naming for keys, here is how we use it (same as in the official aws documentation):

DynamoDb has two key types **Partition Key** (hashkey - dynamodb internally uses a hash function to evenly distribute data items across partitions) and **Sort Key** (rangekey)
The primary key can either be simple (only a partition key) or composite (combination of partition and sort key)

## Condition Expression Builder

#### Expression Attribute Names
By default we create a substitution placeholder for all the attributes, just to not implement a blacklist with reserved words in the context of aws dynamodb.

attributename: age

attributeExpressionNames: {'#age': 'age'}
attributeExpressionValues: {':age': {N: '10'}}
expression: '#age = :age' 

this works seemlesly for top level attribtues, but if we wanna build an expression for where the attribute needs to be accessed with a document path, we need some special logic
nested attribute: person.age

attributeExpressionNames: {'#person':'person', '#age': 'age'}
attributeExpressionValues: {':age': {N: '10'}}
expression: '#person.#age = :age'

we can't use #personAge: 'person.age' because if the dot is part of an attribute name it is not treated as a metacharacter compared to when using directly in expression, so
the above solution needs to be used

these are the accessor rules for nested attribute types
- [n]—for list elements
- . (dot)—for map elements

## Object Mapper

#### Enum
Typescript enums are stored as N(umber) type in DynamoDb, use the @Enum decorator to mark an enum

#### Null Values
Think about an attribute of type string where the value is an empty string, this is not a valid attributeValue to be persisted. There are two solutions for this problem.
1. Don't send the attribute to the backend
2. Use the NULL type to express the empty string

The default for now is to skip properties with empty values depending on type (empty string / empty set, etc)


#### Decorators
Decorators are used to add some metadata to our model classes required by the mapper for some special cases.

This is an experimental feature and requires to set the
 
- "experimentalDecorators": true
- "emitDecoratorMetadata": true

typescript compiler options.

Additionally we rely on the reflect-metadata (https://www.npmjs.com/package/reflect-metadata) library for reflection api.

To get started with decorators just add a @Model() Decorator to any ts class. By default this enables the custom mapping functionality
and will get you started to work with Dynamo DB and simple types (like String, Number, Boolean etc. but no custom classes for example)

We make heavy usage of compile time informations about our models and the property types.
Here is a list of the types that can be retrieved from compile time information for the key design:type. (The metadata will only be added if at least one decorator is
present on a property)

String
Number
Boolean
Array (no generics)
Custom Types

Map / Set will be Object

Generic information is never available due to some serialization limitations at the time of writing.

ES6 types like Set, Map will be mapped to Object when calling for the type via Reflect.get(design:type), so we need some extra info.

##### Collections

#Array
Javascript Arrays with a a items of type String, Number or Binary will be mapped to a S(et) type, by default all other types are mapped to L(ist) type.
If an item of an Array has a complex type the type can be defined using the @TypedArray() Decorator.

#Set
es6 Set types will be marshalled to dynamoDb set type if the type of the set is supported, if the type is not supported it will be
marshalled to an dynamoDB List.  

When one of the following decorators is added, the value is marshalled to a List type.
@SortedSet(), @TypedSet(complexType?)

##Model
Here is the rule how a table name is built `${kebabCase(modelName)}s` so for a model called Product the table will be named products, this is a default implementation.
To Provide your own logic you can implement a TableNameResolver function and give it to the DynamoStore class when implementing a new instance.


**Custom TableName**
@Model({tableName: tableName})


#### Types

Simple Type (no decorators requried to work)
- String
- Number
- Boolean
- Null
- Array

- Date (moment) is mapped by convention (see TODO:addLink Dates)

Complex Types (properties with these types need some decorators to work properly)
- Set<simpleType | complexType>
- Map
- Array<complexType>

##### Date #####
Two Date types are supported. Default JS Date and moment dates.

The type defines how a value will be mapped. Types can be defined using decorators (for complex types) or we use one of the following methods:
fromDB  ->  use default for DynamoDB type (see type table)
toDB    ->  use property value to resolve the type

design:type
String, Number, Boolean, Undefined, Object

unsupported
Set, Map, Date, moment.Moment


#### Dynamo DB

To map an js object into the attribute map required by dynamodb requests, we implement our very oppinionated custom mapper.
We use the DynamoDB Document Mapper to map all «default» types to dynamodb attribute values.

There are some custom requirements for these cases:

- MomentJs Dates
- Use ES6 Map, Set types

Mapper Strategy:

-> To DB
1) check if we have some property metadata
      
      YES                                                      NO
      
      isCustomType                                             document client can map (check with typeof propertyValue for additional security)
      
      YES                 NO
      
      custom mapping      document client can map

-> From DB


## Contribution

## Development

### NPM scripts

 - `npm t`: Run test suite
 - `npm start`: Runs `npm run build` in watch mode
 - `npm run test:watch`: Run test suite in [interactive watch mode](http://facebook.github.io/jest/docs/cli.html#watch)
 - `npm run test:prod`: Run linting and generate coverage
 - `npm run build`: Generage bundles and typings, create docs
 - `npm run lint`: Lints code
 - `npm run commit`: Commit using conventional commit style ([husky](https://github.com/typicode/husky) will tell you to use it if you haven't :wink:)

### Automatic releases

We use automatic releases with Semantic Versioning, follow these simple steps.

semantic-release setup

From now on, you'll need to use `npm run commit`, which is a convenient way to create conventional commits.

Automatic releases are possible thanks to [semantic release](https://github.com/semantic-release/semantic-release), which publishes our code automatically on github and npm, plus generates automatically a changelog. This setup is highly influenced by [Kent C. Dodds course on egghead.io](https://egghead.io/courses/how-to-write-an-open-source-javascript-library)

### Git Hooks

There is already set a `precommit` hook for formatting your code with Prettier :nail_care:

By default, there are 2 disabled git hooks. They're set up when you run the `npm run semantic-release-prepare` script. They make sure:
 - You follow a [conventional commit message](https://github.com/conventional-changelog/conventional-changelog)
 - Your build is not gonna fail in [Travis](https://travis-ci.org) (or your CI server), since it's runned locally before `git push`

This makes more sense in combination with [automatic releases](#automatic-releases)

#### What if I don't want to use coveralls or report my coverage?

Remove `npm run report-coverage` from `.travis.yml`

## Credits

Made with :heart: by [@michaelwittwer](https://github.com/michaelwittwer) and all these wonderful contributors ([emoji key](https://github.com/kentcdodds/all-contributors#emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
| [<img src="https://avatars.githubusercontent.com/u/6052309?v=3" width="100px;"/><br /><sub>Ciro</sub>](https://www.linkedin.com/in/ciro-ivan-agulló-guarinos-42109376)<br />[💻](https://github.com/alexjoverm/typescript-library-starter/commits?author=k1r0s "Code") [🔧](#tool-k1r0s "Tools") | [<img src="https://avatars.githubusercontent.com/u/947523?v=3" width="100px;"/><br /><sub>Marius Schulz</sub>](https://blog.mariusschulz.com)<br />[📖](https://github.com/alexjoverm/typescript-library-starter/commits?author=mariusschulz "Documentation") | [<img src="https://avatars.githubusercontent.com/u/4152819?v=3" width="100px;"/><br /><sub>Alexander Odell</sub>](https://github.com/alextrastero)<br />[📖](https://github.com/alexjoverm/typescript-library-starter/commits?author=alextrastero "Documentation") | [<img src="https://avatars1.githubusercontent.com/u/8728882?v=3" width="100px;"/><br /><sub>Ryan Ham</sub>](https://github.com/superamadeus)<br />[💻](https://github.com/alexjoverm/typescript-library-starter/commits?author=superamadeus "Code") | [<img src="https://avatars1.githubusercontent.com/u/8458838?v=3" width="100px;"/><br /><sub>Chi</sub>](https://consiiii.me)<br />[💻](https://github.com/alexjoverm/typescript-library-starter/commits?author=ChinW "Code") [🔧](#tool-ChinW "Tools") [📖](https://github.com/alexjoverm/typescript-library-starter/commits?author=ChinW "Documentation") | [<img src="https://avatars2.githubusercontent.com/u/2856501?v=3" width="100px;"/><br /><sub>Matt Mazzola</sub>](https://github.com/mattmazzola)<br />[💻](https://github.com/alexjoverm/typescript-library-starter/commits?author=mattmazzola "Code") [🔧](#tool-mattmazzola "Tools") | [<img src="https://avatars0.githubusercontent.com/u/2664047?v=3" width="100px;"/><br /><sub>Sergii Lischuk</sub>](http://leefrost.github.io)<br />[💻](https://github.com/alexjoverm/typescript-library-starter/commits?author=Leefrost "Code") |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| [<img src="https://avatars1.githubusercontent.com/u/618922?v=3" width="100px;"/><br /><sub>Steve Lee</sub>](http;//opendirective.com)<br />[🔧](#tool-SteveALee "Tools") | [<img src="https://avatars0.githubusercontent.com/u/5127501?v=3" width="100px;"/><br /><sub>Flavio Corpa</sub>](http://flaviocorpa.com)<br />[💻](https://github.com/alexjoverm/typescript-library-starter/commits?author=kutyel "Code") | [<img src="https://avatars2.githubusercontent.com/u/22561997?v=3" width="100px;"/><br /><sub>Dom</sub>](https://github.com/foreggs)<br />[🔧](#tool-foreggs "Tools") |
<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/kentcdodds/all-contributors) specification. Contributions of any kind welcome!
