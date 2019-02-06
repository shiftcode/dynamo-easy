# Dynamo-Easy Config

## Authorization

```typescript
import { updateDynamoEasyConfig } from '@shiftcoders/dynamo-easy'

updateDynamoEasyConfig({
    sessionValidityEnsurer: ():Observable<void> => {
        // do whatever you need to do to make sure the session is valid
        // and return an Observable<void> when done
        return of(true).pipe(map(() => { return }))
    }
})
```

## Logging

To receive log statements from dynamo-easy you need to provide a function

```typescript
import { LogInfo, updateDynamoEasyConfig } from '@shiftcoders/dynamo-easy'

updateDynamoEasyConfig({
    logReceiver: (logInfo: LogInfo) => {
        const msg = `[${logInfo.level}] ${logInfo.timestamp} ${logInfo.className} (${
        logInfo.modelClass
      }): ${logInfo.message}`
      console.debug(msg, logInfo.data)
    }
})
```

## TableNameResolver

To use different table names per stage you can provide the tableNameResolver function.

This function will receive the default table name \(either resolved using the model name or custom value when a tableName was provided in the @Model decorator\) and needs to return the extended table name as string.

```typescript
import { TableNameResolver, updateDynamoEasyConfig } from '@shiftcoders/dynamo-easy'

const myTableNameResolver: TableNameResolver = (tableName: string) => {
  return `myPrefix-${tableName}`
}

updateDynamoEasyConfig({
  tableNameResolver: myTableNameResolver
})
```

## DateMapper

If you want to use a different type for the @DateProperty decorator \(eg. Moment or DayJS\) you need to define a custom mapper and provide it to the easy config.

```typescript
import { updateDynamoEasyConfig } from '@shiftcoders/dynamo-easy'
import { momentDateMapper } from './moment-date.mapper'

updateDynamoEasyConfig({
  dateMapper: momentDateMapper
})
```

{% page-ref page="../model/custommapper.md" %}

