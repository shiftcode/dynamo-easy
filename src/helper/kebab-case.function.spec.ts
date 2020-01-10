import { kebabCase } from './kebab-case.function'

describe('kebabCase', () => {
  it('should work', () => {
    expect(kebabCase('the quick brown fox')).toBe('the-quick-brown-fox')
    expect(kebabCase('the-quick-brown-fox')).toBe('the-quick-brown-fox')
    expect(kebabCase('the_quick_brown_fox')).toBe('the-quick-brown-fox')
    expect(kebabCase('theQuickBrownFox')).toBe('the-quick-brown-fox')
    expect(kebabCase('theQuickBrown Fox')).toBe('the-quick-brown-fox')
    expect(kebabCase('thequickbrownfox')).toBe('thequickbrownfox')
    expect(kebabCase('the - quick * brown# fox')).toBe('the-quick-brown-fox')
    expect(kebabCase('theQUICKBrownFox')).toBe('the-q-u-i-c-k-brown-fox')
  })
})
