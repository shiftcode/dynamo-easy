---
description: First simple sample not at all showing the full power of the library
---

# Jump into code

Start with defining your first model

{% code-tabs %}
{% code-tabs-item title="person.ts" %}
```typescript
@Model()
class Person{
  @PartitionKey() 
  id: string
  
  name: string
}
```
{% endcode-tabs-item %}
{% endcode-tabs %}

then create a DynamoStore instance to execute actions against the DynamoDB.

{% code-tabs %}
{% code-tabs-item title="app.ts" %}
```typescript
import * as AWS from 'aws-sdk/global'

// update the aws config with your credentials to enable successful connection
AWS.config.update({region: 'yourAwsRegion', })

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
{% endcode-tabs-item %}
{% endcode-tabs %}



