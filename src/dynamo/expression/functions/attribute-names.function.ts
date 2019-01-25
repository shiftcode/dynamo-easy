import { Metadata } from '../../../decorator/metadata'

export const NESTED_ATTR_PATH_CAPTURED_REGEX = /([a-zA-Z_]+)(?:\[(\d+)])?\.?/g
export const NESTED_ATTR_PATH_REGEX = /^.+((\[(\d+)])|(\.)).*$/

// problem: we only get the metadata from the last property -> but we need it for all properties in the chain (prop1.prop2.prop3)
export function resolveAttributeNames(
  attributePath: string,
  metadata?: Metadata<any> | undefined,
): { placeholder: string; attributeNames: Record<string, string> } {
  let placeholder: string
  // tslint:disable-next-line:no-shadowed-variable
  const attributeNames: Record<string, string> = {}
  if (new RegExp(NESTED_ATTR_PATH_REGEX).test(attributePath)) {
    const regex = new RegExp(NESTED_ATTR_PATH_CAPTURED_REGEX)
    // nested attribute with document path (map or list)
    const currentPath = []
    let regExpResult: RegExpExecArray | null
    const namePlaceholders: string[] = []
    // tslint:disable-next-line:no-conditional-assignment
    while ((regExpResult = regex.exec(attributePath)) !== null) {
      // path part is pos 1 - full match would be 0
      const pathPart = regExpResult[1]
      currentPath.push(regExpResult[1])
      const collectionIndex = regExpResult[2]

      const propertyMetadata = metadata && metadata.forProperty(currentPath.join('.'))

      // fixme
      attributeNames[`#${pathPart}`] = propertyMetadata ? propertyMetadata.nameDb : pathPart
      if (collectionIndex !== undefined) {
        namePlaceholders.push(`#${pathPart}[${collectionIndex}]`)
      } else {
        namePlaceholders.push(`#${pathPart}`)
      }
    }
    placeholder = namePlaceholders.join('.')
  } else {
    // top level attribute
    const propertyMetadata = metadata && metadata.forProperty(attributePath)
    attributeNames[`#${attributePath}`] = propertyMetadata ? propertyMetadata.nameDb : attributePath
    placeholder = `#${attributePath}`
  }

  return {
    placeholder,
    attributeNames,
  }
}
