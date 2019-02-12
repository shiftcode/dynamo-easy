# Dynamo-Easy
[![Travis](https://img.shields.io/travis/com/shiftcode/dynamo-easy.svg)](https://travis-ci.com/shiftcode/dynamo-easy)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![latest-release](https://img.shields.io/npm/v/@shiftcoders/dynamo-easy/latest.svg)]()
[![Coverage Status](https://coveralls.io/repos/github/shiftcode/dynamo-easy/badge.svg?branch=master)](https://coveralls.io/github/shiftcode/dynamo-easy?branch=master)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![All Contributors](https://img.shields.io/badge/all_contributors-3-orange.svg?style=flat-square)](#contributors)


A dynamoDB client which provides an easy to use fluent api to execute requests. It supports typescript decorators, to define the necessary metadata for your models. You don't need to care about the mapping of javascript types to their dynamo types any more. We got you covered.

Built with :heart: by [shiftcode](https://www.shiftcode.ch).

## Show me some code
```typescript
import { Model, PartitionKey, DynamoStore } from '@shiftcoders/dynamo-easy'

@Model()
export class Person {
  @PartitionKey()
  id: string
  name: string
  yearOfBirth: number
}

const personStore = new DynamoStore(Person)

personStore
  .scan()
  .whereAttribute('yearOfBirth').equals(1958)
  .exec()
  .then(res => console.log('ALL items with yearOfBirth == 1958', res))

```

## Ressources
- 🤓 Learn more visiting the [docs](https://shiftcode.gitbook.io/dynamo-easy)
- 📖 Checkout the technical API documentation [api docs](https://shiftcode.github.io/dynamo-easy/)
- 🚀 Check the running sample on [Stackblitz](https://stackblitz.com/edit/dynamo-easy-node-sample)
  - [demo git repository](https://github.com/shiftcode/dynamo-easy-demo)

## Credits
- [typescript-library-starter](https://github.com/alexjoverm/typescript-library-starter) - Starter project which helps creating a TypeScript library project
- [vogels](https://github.com/ryanfitz/vogels) - To get an idea on how to build the fluent api
- [typestore](http://densebrain.github.io/typestore/) - Inspiration on how to implement the model decorators
- [BrowserStack](https://www.browserstack.com) - We use BrowserStack to verify everything works as expected
![BrowserStack](https://github.com/shiftcode/dynamo-easy/browserstack-logo.png)

## Contributors
Made with :heart: by [@michaelwittwer](https://github.com/michaelwittwer) and all these wonderful contributors ([emoji key](https://github.com/kentcdodds/all-contributors#emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore -->
<table><tr><td align="center"><a href="https://www.shiftcode.ch"><img src="https://avatars1.githubusercontent.com/u/8394182?v=4" width="100px;" alt="Michael Wittwer"/><br /><sub><b>Michael Wittwer</b></sub></a><br /><a href="#ideas-michaelwittwer" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/shiftcode/dynamo-easy/commits?author=michaelwittwer" title="Code">💻</a> <a href="https://github.com/shiftcode/dynamo-easy/commits?author=michaelwittwer" title="Tests">⚠️</a> <a href="https://github.com/shiftcode/dynamo-easy/commits?author=michaelwittwer" title="Documentation">📖</a></td><td align="center"><a href="https://github.com/simonmumenthaler"><img src="https://avatars3.githubusercontent.com/u/37636934?v=4" width="100px;" alt="Simon Mumenthaler"/><br /><sub><b>Simon Mumenthaler</b></sub></a><br /><a href="#ideas-simonmumenthaler" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/shiftcode/dynamo-easy/commits?author=simonmumenthaler" title="Code">💻</a> <a href="https://github.com/shiftcode/dynamo-easy/commits?author=simonmumenthaler" title="Tests">⚠️</a> <a href="https://github.com/shiftcode/dynamo-easy/commits?author=simonmumenthaler" title="Documentation">📖</a></td><td align="center"><a href="https://github.com/michaellieberherrr"><img src="https://avatars1.githubusercontent.com/u/8321523?v=4" width="100px;" alt="Michael Lieberherr"/><br /><sub><b>Michael Lieberherr</b></sub></a><br /><a href="https://github.com/shiftcode/dynamo-easy/commits?author=michaellieberherrr" title="Code">💻</a> <a href="https://github.com/shiftcode/dynamo-easy/commits?author=michaellieberherrr" title="Documentation">📖</a> <a href="https://github.com/shiftcode/dynamo-easy/commits?author=michaellieberherrr" title="Tests">⚠️</a></td></tr></table>
<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/kentcdodds/all-contributors) specification. Contributions of any kind welcome!
