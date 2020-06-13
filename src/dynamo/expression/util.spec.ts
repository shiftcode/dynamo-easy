/* eslint-disable no-template-curly-in-string */
import { dynamicTemplate } from './util'

describe('util', () => {
  it('should replace template vars dynamically', () => {
    const error = 'my sample error ${errorMessage} with some stuff in there and another ${secondValue}'
    const built = dynamicTemplate(error, { errorMessage: 'the message', secondValue: 5 })
    expect(built).toBe('my sample error the message with some stuff in there and another 5')
  })
})
