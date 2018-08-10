import { FormType } from './order.model'

export class FormId {
  static POSTFIX_MAX_LENGTH = 15
  static POSTFIX_PATTERN = `[\\w\\+\\-\\.]{1,${FormId.POSTFIX_MAX_LENGTH}}` // any word character [a-zA-Z0-9_] and literally + - .
  static REGEX_POSTFIX = new RegExp(`^${FormId.POSTFIX_PATTERN}$`)

  static PREFIX_TO_TYPE_MAP = new Map([
    ['AF', FormType.REQUEST],
    ['AG', FormType.QUOTE],
    ['BE', FormType.ORDER],
    ['AB', FormType.CONFIRMATION],
    ['LS', FormType.DELIVERY],
    ['RE', FormType.INVOICE],
    ['GU', FormType.CREDIT],
    ['BL', FormType.DEBIT],
    ['ER', FormType.FAILURE_RETURN],
    ['DB', FormType.COVER],
    ['PS', FormType.PALETTE_INFO],
    ['RA', FormType.FRAME_ORDER],
    ['MA', FormType.WARNING],
    ['PA', FormType.INVOICE_GMBH],
    ['BEL', FormType.STOCK_ORDER],
    ['DBL', FormType.STOCK_COVER],
  ])

  type: FormType
  // if there are multiple forms for one formType the formId must have an additional postfix to be unique
  postfix: string | undefined | null
  counter: number
  year: number

  // BE00042018(-postfix)
  static parse(formId: string): FormId {
    // formType BEL / DBL has 3 digits prefix for type. if so we add +1 otherwise +0
    const addition: number = !isNaN(parseInt(formId.charAt(2), 10)) ? 0 : 1
    const typeString = formId.slice(0, 2 + addition).toUpperCase()
    const type: FormType | null | undefined = FormId.PREFIX_TO_TYPE_MAP.has(typeString)
      ? FormId.PREFIX_TO_TYPE_MAP.get(typeString)
      : null
    const counter: number = Number.parseInt(formId.slice(2 + addition, 6 + addition).replace('0', ''), 10)
    const year: number = Number.parseInt(formId.slice(6 + addition, 10 + addition), 10)
    const postfix: string | null = formId.length > 10 + addition ? formId.slice(11 + addition) : null
    return new FormId(type!, counter, year, postfix)
  }

  /**
   * produces a human readable version of the id, here are some examples of the different display possibilities:
   * compact: BE00012017(-postfix)
   * full: Bestellung00012017(-postfix)
   * print: Bestellung BE00012017(-postfix)
   *
   * @param formId
   * @param mode
   * @param hidePostfix
   * @returns {string}
   */
  static toString(formId: FormId, hidePostfix?: boolean): string {
    // use the join method with array length to produce leading zeroes
    let prefix: string | undefined
    const leadingZeroes: string = new Array(4 + 1 - (formId.counter + '').length).join('0')
    for (const [key, value] of FormId.PREFIX_TO_TYPE_MAP) {
      if (value === formId.type) {
        prefix = key
      }
    }

    return (
      (prefix ? prefix : '') +
      leadingZeroes +
      formId.counter +
      formId.year +
      (formId.postfix && hidePostfix !== true ? `-${formId.postfix}` : '')
    )
  }

  constructor(type: FormType, counter: number, year: number, postfix?: string | null) {
    this.type = type
    this.postfix = postfix
    this.year = year
    this.counter = counter
  }
}
