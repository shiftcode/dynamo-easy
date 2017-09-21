import { attributeNameReplacer } from './attribute-name-replacer.function'
import { BRACED_INDEX_REGEX } from './unique-attribute-value-name.function'

describe('attribute value replaces', () => {
  it('should replace', () => {
    const attrPath = 'list[0]'
    expect(attrPath.replace(BRACED_INDEX_REGEX, attributeNameReplacer)).toBe('list_at_0')
  })

  it('should replace 2', () => {
    const attrPath = 'list[0].ages[2]'
    expect(attrPath.replace(BRACED_INDEX_REGEX, attributeNameReplacer)).toBe('list_at_0.ages_at_2')
  })

  it('should replace 3', () => {
    const attrPath = 'attr.persons[0].age'
    expect(attrPath.replace(BRACED_INDEX_REGEX, attributeNameReplacer)).toBe('attr.persons_at_0.age')
  })

  it('should replace 4', () => {
    const attrPath = 'attr[2].persons[0].age'
    expect(attrPath.replace(BRACED_INDEX_REGEX, attributeNameReplacer)).toBe('attr_at_2.persons_at_0.age')
  })
})
