import { PropertyMetadata } from '../../../decorator/metadata/property-metadata.model'

const NESTED_ATTR_PATH_CAPTURED_REGEX = /([a-z]+)(?:\[(\d+)])?\.?/g
const NESTED_ATTR_PATH_REGEX = /^.+((\[(\d+)])|(\.)).*$/

export function resolveAttributeNames(
  attributePath: string,
  propertyMetadata?: PropertyMetadata<any>
): { placeholder: string; attributeNames: { [key: string]: string } } {
  let placeholder: string
  // tslint:disable-next-line:no-shadowed-variable
  const attributeNames: { [key: string]: string } = {}
  if (NESTED_ATTR_PATH_REGEX.test(attributePath)) {
    // nested attribute with document path (map or list)
    let re
    const namePlaceholders: string[] = []
    // tslint:disable-next-line:no-conditional-assignment
    while ((re = NESTED_ATTR_PATH_CAPTURED_REGEX.exec(attributePath)) !== null) {
      // path part is pos 1 - full match would be 0
      const pathPart = re[1]
      const collectionIndex = re[2]

      let pathPartDb
      // get propertyMetdata of nested attribute if available
      if (propertyMetadata) {
        pathPartDb = propertyMetadata.nameDb
      } else {
        pathPartDb = pathPart
      }

      attributeNames[`#${pathPartDb}`] = pathPart
      if (collectionIndex !== undefined) {
        namePlaceholders.push(`#${pathPartDb}[${collectionIndex}]`)
      } else {
        namePlaceholders.push(`#${pathPartDb}`)
      }
    }
    placeholder = namePlaceholders.join('.')
  } else {
    // top level attribute
    let attrPathDb
    if (propertyMetadata) {
      attrPathDb = propertyMetadata.nameDb
    } else {
      attrPathDb = attributePath
    }
    attributeNames[`#${attributePath}`] = attrPathDb
    placeholder = `#${attributePath}`
  }

  return {
    placeholder,
    attributeNames,
  }
}
