---
description: some description
---

# Installation

```text
npm i @shiftcoders/dynamo-easy --save
npm i reflect-metadata@^0.1.12 --save
```

Also install all the required peer dependencies listed in  `package.json`of @shiftcoders/dynamo-easy

{% hint style="info" %}
The reflect-metadata polyfill should be imported only once in your entire application, because the Reflect object is meant to be a global singleton. Import it in some entry file of you app.
{% endhint %}

{% code-tabs %}
{% code-tabs-item title="entry.ts \(or some other entry file\)" %}
```typescript
import "reflect-metadata"
```
{% endcode-tabs-item %}
{% endcode-tabs %}

If you are using the reflect-metadata api in your project, make sure to include the typings. The type definitions are included in the npm package.

{% code-tabs %}
{% code-tabs-item title="tsconfig.json" %}
```javascript
{
    "types": ["reflect-metadata"]
}
```
{% endcode-tabs-item %}
{% endcode-tabs %}

We make heavy usage of Typescript decorators, so you also need to enable the typescript features

{% code-tabs %}
{% code-tabs-item title="tsconfig.ts" %}
```javascript
{
    "experimentalDecorators": true
    "emitDecoratorMetadata": true
}
```
{% endcode-tabs-item %}
{% endcode-tabs %}



