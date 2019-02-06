import { TableNameResolver, updateDynamoEasyConfig } from '@shiftcoders/dynamo-easy'

const myTableNameResolver: TableNameResolver = (tableName: string) => {
  return `myPrefix-${tableName}`
}

updateDynamoEasyConfig({
  tableNameResolver: myTableNameResolver
})
