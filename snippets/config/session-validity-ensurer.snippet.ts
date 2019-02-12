import { updateDynamoEasyConfig } from '@shiftcoders/dynamo-easy'

updateDynamoEasyConfig({
  sessionValidityEnsurer: (): Promise<void> => {
    // do whatever you need to do to make sure the session is valid
    // and return an Promise<void> when done
    return Promise.resolve()
  },
})
