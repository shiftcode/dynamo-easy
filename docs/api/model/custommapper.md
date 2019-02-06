---
description: >-
  With custom mappers you're able to define how the JS values are mapped (toDb)
  and how the dynamoDB attributes are parsed (fromDb).
---

# CustomMapper

Scenarios you need to use a custom mapper:

* Using complex objects as partition key or sort key \(since dynamoDB only supports \[N\]umber \| \[S\]tring \| \[B\]inary for such\)
* working with class instances instead of plain javascript objects \(e.g. Dates\)
* Storing complex objects in dynamoDB set \(only N\|S\|B sets are possible\)

A mapper for date objects which would be stored as \[N\]umbers could look like this:

{% code-tabs %}
{% code-tabs-item title="date-to-number.mapper.ts" %}
```typescript
import { MapperForType, NumberAttribute } from '@shiftcoders/dynamo-easy'

export const dateToNumberMapper: MapperForType<Date, NumberAttribute> = {
  fromDb: attributeValue => new Date(parseInt(attributeValue.N, 10)),
  toDb: propertyValue => ({ N: `${propertyValue.getTime()}` }),
}
```
{% endcode-tabs-item %}
{% endcode-tabs %}

