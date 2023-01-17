// tslint:disable:max-classes-per-file
import { Model } from '../../src/decorator/impl/model/model.decorator'
import { Property } from '../../src/decorator/impl/property/property.decorator'
import { MapperForType } from '../../src/mapper/for-type/base.mapper'
import { StringAttribute } from '../../src/mapper/type/attribute.type'

export class MyProp {
  static default() {
    return new MyProp('default', 'none')
  }

  static parse(v: string) {
    const p = v.split('-')
    return new MyProp(p[0], p[1])
  }

  static toString(v: MyProp) {
    return `${v.type}-${v.name}`
  }

  constructor(public type: string, public name: string) {}

  toString() {
    return MyProp.toString(this)
  }
}

const myPropMapper: MapperForType<MyProp, StringAttribute> = {
  fromDb: (a) => MyProp.parse(a.S),
  toDb: (v) => ({ S: MyProp.toString(v) }),
}

@Model()
export class ModelWithCustomMapperAndDefaultValue {
  @Property({
    mapper: myPropMapper,
    defaultValueProvider: () => MyProp.default(),
  })
  myProp: MyProp
}
