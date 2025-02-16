// tslint:disable:no-non-null-assertion
// tslint:disable:no-string-literal
import {
  organization1CreatedAt,
  organization1Employee1CreatedAt,
  organization1Employee2CreatedAt,
  organization1LastUpdated,
  organizationFromDb,
} from '../../test/data/organization-dynamodb.data'
import { productFromDb } from '../../test/data/product-dynamodb.data'
import {
  Birthday,
  Employee,
  Gift,
  Id,
  ModelWithCustomMapperAndDefaultValue,
  ModelWithCustomMapperModel,
  ModelWithDateAsHashKey,
  ModelWithDateAsIndexHashKey,
  ModelWithDefaultValue,
  ModelWithNonDecoratedEnum,
  ModelWithoutCustomMapper,
  ModelWithoutCustomMapperOnIndex,
  MyProp,
  Organization,
  OrganizationEvent,
  Product,
  ProductNested,
  SimpleModel,
  SimpleWithCompositePartitionKeyModel,
  SimpleWithPartitionKeyModel,
  SimpleWithRenamedCompositePartitionKeyModel,
  SimpleWithRenamedPartitionKeyModel,
  StringType,
  Type,
} from '../../test/models'
import { IdMapper } from '../../test/models/model-with-custom-mapper.model'
import { ModelWithEmptyValues } from '../../test/models/model-with-empty-values'
import {
  ModelWithNestedModelWithCustomMapper,
  NestedModelWithCustomMapper,
} from '../../test/models/model-with-nested-model-with-custom-mapper.model'
import { NestedComplexModel } from '../../test/models/nested-complex.model'
import * as DynamoDB from '@aws-sdk/client-dynamodb'
import { metadataForModel } from '../decorator/metadata/metadata-for-model.function'
import { PropertyMetadata } from '../decorator/metadata/property-metadata.model'
import { createKeyAttributes, createToKeyFn, fromDb, fromDbOne, toDb, toDbOne, toKey } from './mapper'
import {
  Attribute,
  Attributes,
  BooleanAttribute,
  ListAttribute,
  MapAttribute,
  NullAttribute,
  NumberAttribute,
  StringAttribute,
  StringSetAttribute,
} from './type/attribute.type'

describe('Mapper', () => {
  describe('should map single values', () => {
    describe('to db', () => {
      it('string', () => {
        const attrValue = <StringAttribute>toDbOne('foo')!
        expect(attrValue).toBeDefined()
        expect(attrValue.S).toBeDefined()
        expect(attrValue.S).toBe('foo')
      })

      it('string (empty)', () => {
        const attrValue = <StringAttribute>toDbOne('')!
        expect(attrValue.S).toStrictEqual('')
      })

      it('number', () => {
        const attrValue = <NumberAttribute>toDbOne(3)!
        expect(attrValue).toBeDefined()
        expect(keyOf(attrValue)).toBe('N')
        expect(attrValue.N).toBe('3')
      })

      it('number (NaN)', () => {
        const attrValue = <NumberAttribute>toDbOne(NaN)!
        expect(attrValue).toBeNull()
      })

      it('boolean', () => {
        const attrValue = <BooleanAttribute>toDbOne(false)!
        expect(attrValue).toBeDefined()
        expect(keyOf(attrValue)).toBe('BOOL')
        expect(attrValue.BOOL).toBe(false)
      })

      it('null', () => {
        const attrValue = <NullAttribute>toDbOne(null)!
        expect(attrValue).toBeDefined()
        expect(keyOf(attrValue)).toBe('NULL')
        expect(attrValue.NULL).toBe(true)
      })

      it('enum (number)', () => {
        const attrValue = <NumberAttribute>toDbOne(Type.FirstType)!
        expect(attrValue).toBeDefined()
        expect(keyOf(attrValue)).toBe('N')
        expect(attrValue.N).toBe('0')
      })

      it('enum (string)', () => {
        const attrValue = <StringAttribute>toDbOne(StringType.FirstType)!
        expect(attrValue).toBeDefined()
        expect(keyOf(attrValue)).toBe('S')
        expect(attrValue.S).toBe('first')
      })

      it('enum (propertyMetadata -> no enum decorator)', () => {
        const attrValue: Attribute = <MapAttribute>toDbOne(Type.FirstType, <any>{
          typeInfo: { type: Object },
        })!
        expect(attrValue).toBeDefined()
        expect(keyOf(attrValue)).toBe('M')
        expect(attrValue.M).toEqual({})
      })

      it('array -> L(ist) (no explicit type)', () => {
        const attrValue = <ListAttribute<StringAttribute>>toDbOne(['foo', 'bar'])!
        expect(attrValue).toEqual({ L: [{ S: 'foo' }, { S: 'bar' }] })
      })

      it('array -> L(ist) (homogeneous, no duplicates, explicit type)', () => {
        const propertyMetadata = <Partial<PropertyMetadata<any>>>{
          isSortedCollection: true,
          typeInfo: {
            type: Array,
          },
        }
        const attrValue = <ListAttribute<StringAttribute>>toDbOne(['foo', 'bar'], <any>propertyMetadata)!
        expect(attrValue).toBeDefined()
        expect(keyOf(attrValue)).toBe('L')

        expect(keyOf(attrValue.L[0])).toBe('S')
        expect(attrValue.L[0].S).toBe('foo')

        expect(keyOf(attrValue.L[1])).toBe('S')
        expect(attrValue.L[1].S).toBe('bar')
      })

      it('array -> L(ist) (heterogeneous, no duplicates)', () => {
        const attrValue = <ListAttribute>toDbOne(['foo', 56, true])!
        expect(attrValue).toBeDefined()
        expect(keyOf(attrValue)).toBe('L')
        expect(attrValue.L).toBeDefined()
        expect(attrValue.L.length).toBe(3)

        const foo = <StringAttribute>attrValue.L[0]
        expect(foo).toBeDefined()
        expect(keyOf(foo)).toBe('S')
        expect(foo.S).toBe('foo')

        const no = <NumberAttribute>attrValue.L[1]
        expect(no).toBeDefined()
        expect(keyOf(no)).toBe('N')
        expect(no.N).toBe('56')

        const bool = <BooleanAttribute>attrValue.L[2]
        expect(bool).toBeDefined()
        expect(keyOf(bool)).toBe('BOOL')
        expect(bool.BOOL).toBe(true)
      })

      it('array -> L(ist) (homogeneous, complex type)', () => {
        const attrValue = <ListAttribute>toDbOne([
          { name: 'max', age: 25, sortedSet: null },
          { name: 'anna', age: 65, sortedSet: null },
        ])!

        expect(attrValue).toBeDefined()
        expect(keyOf(attrValue)).toBe('L')

        const employee1 = <MapAttribute<Employee>>attrValue.L[0]
        expect(employee1).toBeDefined()
        expect(keyOf(employee1)).toBe('M')
        expect(Object.keys(employee1.M).length).toBe(3)
        expect(employee1.M.name).toBeDefined()
        expect(keyOf(employee1.M.name)).toBe('S')
        expect((<StringAttribute>employee1.M.name).S).toBe('max')

        expect(employee1.M.age).toBeDefined()
        expect(keyOf(employee1.M.age)).toBe('N')
        expect((<NumberAttribute>employee1.M.age).N).toBe('25')

        expect(employee1.M.age).toBeDefined()
        expect(keyOf(employee1.M.sortedSet)).toBe('NULL')
        expect((<NullAttribute>employee1.M.sortedSet).NULL).toBe(true)
      })

      it('heterogenous Set without decorator should throw', () => {
        expect(() => toDbOne(new Set(['foo', 'bar', 25]))).toThrow()
      })

      it('heterogenous Set with decorator to L(ist)', () => {
        const meta: PropertyMetadata<any, any> = <any>{
          typeInfo: {
            type: Set,
          },
        }
        const attrValue = toDbOne(new Set(['foo', 'bar', 25]), meta)
        expect(attrValue).toEqual({ L: [{ S: 'foo' }, { S: 'bar' }, { N: '25' }] })
      })

      it('Set (empty) -> null', () => {
        const attrValue = <NullAttribute>toDbOne(new Set())!
        expect(attrValue).toBeNull()
      })

      it('Set of objects without decorator should throw', () => {
        expect(() =>
          toDbOne(
            new Set([
              { name: 'foo', age: 7 },
              { name: 'bar', age: 42 },
            ]),
          ),
        ).toThrow()
      })

      it('Set of objects with decorator -> L(ist)', () => {
        const meta: PropertyMetadata<any> = <any>{
          typeInfo: {
            type: Set,
          },
        }
        const attrValue = <ListAttribute>toDbOne(
          new Set([
            { name: 'foo', age: 7 },
            { name: 'bar', age: 42 },
          ]),
          meta,
        )

        expect(attrValue).toEqual({
          L: [{ M: { name: { S: 'foo' }, age: { N: '7' } } }, { M: { name: { S: 'bar' }, age: { N: '42' } } }],
        })
      })

      it('simple object', () => {
        const attrValue = <MapAttribute<{ name: StringAttribute; age: NumberAttribute }>>(
          toDbOne({ name: 'foo', age: 56 })!
        )
        expect(attrValue).toBeDefined()
        expect(keyOf(attrValue)).toBe('M')

        // name
        expect(attrValue.M.name).toBeDefined()
        expect(keyOf(attrValue.M.name)).toBe('S')
        expect((<StringAttribute>attrValue.M.name).S).toBe('foo')

        // age
        expect(attrValue.M.age).toBeDefined()
        expect(keyOf(attrValue.M.age)).toBe('N')
        expect((<NumberAttribute>attrValue.M.age).N).toBe('56')
      })

      it('complex object', () => {
        interface ObjType {
          name: StringAttribute
          age: NumberAttribute
          children: ListAttribute
        }

        const attrValue = <MapAttribute<ObjType>>toDbOne({
          name: 'Max',
          age: 35,
          children: [
            { name: 'Anna', age: 5 },
            { name: 'Hans', age: 7 },
          ],
        })!
        expect(attrValue).toBeDefined()
        expect(keyOf(attrValue)).toBe('M')

        const nameAttr = <StringAttribute>attrValue.M.name

        // name
        expect(nameAttr).toBeDefined()
        expect(keyOf(nameAttr)).toBe('S')
        expect(nameAttr.S).toBe('Max')

        // age
        expect(attrValue.M.age).toBeDefined()
        expect(keyOf(attrValue.M.age)).toBe('N')
        expect((<NumberAttribute>attrValue.M.age).N).toBe('35')

        // children
        expect(attrValue.M.children).toBeDefined()
        expect(keyOf(attrValue.M.children)).toBe('L')
        expect((<ListAttribute>attrValue.M.children).L.length).toBe(2)
        expect(keyOf((<ListAttribute>attrValue.M.children).L[0])).toBe('M')
        expect(keyOf((<ListAttribute>attrValue.M.children).L[1])).toBe('M')

        const firstChild = <MapAttribute<ObjType>>(<ListAttribute>attrValue.M.children).L[0]
        // first child
        expect(firstChild.M.name).toBeDefined()
        expect(keyOf(firstChild.M.name)).toBe('S')
        expect((<StringAttribute>firstChild.M.name).S).toBe('Anna')

        expect(firstChild.M.age).toBeDefined()
        expect(keyOf(firstChild.M.age)).toBe('N')
        expect((<NumberAttribute>firstChild.M.age).N).toBe('5')

        const secondChild: MapAttribute<ObjType> = <MapAttribute<ObjType>>(<ListAttribute>attrValue.M.children).L[1]
        // second child
        expect(secondChild.M.name).toBeDefined()
        expect(keyOf(secondChild.M.name)).toBe('S')
        expect((<StringAttribute>secondChild.M.name).S).toBe('Hans')

        expect(secondChild.M.age).toBeDefined()
        expect(keyOf(secondChild.M.age)).toBe('N')
        expect((<NumberAttribute>secondChild.M.age).N).toBe('7')
      })
    })

    describe('from db', () => {
      it('S -> String', () => {
        const attrValue = { S: 'foo' }
        expect(fromDbOne(attrValue)).toBe('foo')
      })

      it('N -> Number', () => {
        const attrValue = { N: '56' }
        expect(fromDbOne(attrValue)).toBe(56)
      })

      it('BOOL -> Boolean', () => {
        const attrValue = { BOOL: true }
        expect(fromDbOne(attrValue)).toBe(true)
      })

      it('NULL -> null', () => {
        const attrValue = { NULL: true }
        expect(fromDbOne(attrValue)).toBe(null)
      })

      it('SS -> set', () => {
        const attrValue = { SS: ['foo', 'bar'] }
        const set: Set<string> = fromDbOne(attrValue)
        // noinspection SuspiciousInstanceOfGuard
        expect(set instanceof Set).toBeTruthy()
        expect([...set]).toEqual(['foo', 'bar'])
      })

      it('SS -> array', () => {
        const propertyMetadata = <Partial<PropertyMetadata<any>>>{
          typeInfo: { type: Array },
        }
        const attrValue = { SS: ['foo', 'bar'] }
        const arr = fromDbOne<string[]>(attrValue, <any>propertyMetadata)
        expect(Array.isArray(arr)).toBeTruthy()
        expect(arr).toEqual(['foo', 'bar'])
      })

      it('NS -> set', () => {
        const attrValue = { NS: ['45', '2'] }
        const set = fromDbOne<Set<number>>(attrValue)
        // noinspection SuspiciousInstanceOfGuard
        expect(set instanceof Set).toBeTruthy()
        expect(set.size).toBe(2)
        expect(Array.from(set)[0]).toBe(45)
        expect(Array.from(set)[1]).toBe(2)
      })

      it('NS -> array', () => {
        const propertyMetadata = <Partial<PropertyMetadata<any>>>{
          typeInfo: { type: Array },
        }
        const attrValue = { NS: ['45', '2'] }
        const arr = fromDbOne<number[]>(attrValue, <any>propertyMetadata)
        expect(Array.isArray(arr)).toBeTruthy()
        expect(arr.length).toBe(2)
        expect(arr[0]).toBe(45)
        expect(arr[1]).toBe(2)
      })

      it('L -> array', () => {
        const attrValue = { L: [{ S: 'foo' }, { N: '45' }, { BOOL: true }] }
        const arr: any[] = fromDbOne<any[]>(attrValue)
        expect(Array.isArray(arr)).toBeTruthy()
        expect(arr.length).toBe(3)
        expect(arr[0]).toBe('foo')
        expect(arr[1]).toBe(45)
        expect(arr[2]).toBe(true)
      })

      it('L -> set', () => {
        const propertyMetadata = <Partial<PropertyMetadata<any>>>{
          typeInfo: { type: Set },
        }
        const attrValue = { L: [{ S: 'foo' }, { N: '45' }, { BOOL: true }] }
        const set = fromDbOne<Set<any>>(attrValue, <any>propertyMetadata)
        // noinspection SuspiciousInstanceOfGuard
        expect(set instanceof Set).toBeTruthy()
        expect(set.size).toBe(3)
        expect(Array.from(set)[0]).toBe('foo')
        expect(Array.from(set)[1]).toBe(45)
        expect(Array.from(set)[2]).toBe(true)
      })

      it('M', () => {
        const attrValue = {
          M: {
            name: { S: 'name' },
            age: { N: '56' },
            active: { BOOL: true },
            siblings: { SS: ['hans', 'andi', 'dora'] },
          },
        }
        const obj = fromDbOne<any>(attrValue)

        expect(obj.name).toBe('name')
        expect(obj.age).toBe(56)
        expect(obj.active).toBe(true)
        expect(obj.siblings).toBeDefined()
        expect(obj.siblings instanceof Set).toBeTruthy()
        expect(obj.siblings.size).toBe(3)
        expect(Array.from(obj.siblings)[0]).toBe('hans')
        expect(Array.from(obj.siblings)[1]).toBe('andi')
        expect(Array.from(obj.siblings)[2]).toBe('dora')
      })
    })
  })

  describe('should map model', () => {
    describe('to db', () => {
      describe('model class created with new', () => {
        let organization: Organization
        let organizationAttrMap: Attributes<Organization>
        let createdAt: Date
        let lastUpdated: Date
        let createdAtDateEmployee1: Date
        let createdAtDateEmployee2: Date
        let birthday1Date: Date
        let birthday2Date: Date

        beforeEach(() => {
          organization = new Organization()
          organization.id = 'myId'
          organization.name = 'shiftcode GmbH'
          createdAt = new Date()
          organization.createdAtDate = createdAt
          lastUpdated = new Date('2017-03-21')
          organization.lastUpdated = lastUpdated
          organization.active = true
          organization.count = 52

          organization.domains = ['shiftcode.ch', 'shiftcode.io', 'shiftcode.it']
          organization.randomDetails = ['sample', 26, true]

          createdAtDateEmployee1 = new Date('2017-03-05')
          createdAtDateEmployee2 = new Date()

          organization.employees = [
            new Employee('max', 50, createdAtDateEmployee1, []),
            new Employee('anna', 27, createdAtDateEmployee2, []),
          ]

          organization.cities = new Set(['zürich', 'bern'])

          birthday1Date = new Date('1975-03-05')
          birthday2Date = new Date('1987-07-07')
          organization.birthdays = new Set([
            new Birthday(birthday1Date, 'ticket to rome', 'camper van'),
            new Birthday(birthday2Date, 'car', 'gin'),
          ])

          organization.awards = new Set(['good, better, shiftcode', 'just kiddin'])

          const events = new Set<OrganizationEvent>()
          events.add(new OrganizationEvent('shift the web', 1520))
          ;(organization as any).events = events
          organization.transient = 'the value which is marked as transient'

          organizationAttrMap = toDb(organization, Organization)
        })

        describe('creates correct attribute map', () => {
          it('all properties are mapped', () => {
            expect(Object.keys(organizationAttrMap).length).toBe(13)
          })

          it('id', () => {
            expect(organizationAttrMap.id).toEqual({ S: 'myId' })
          })

          it('createdAtDate', () => {
            expect(organizationAttrMap.createdAtDate).toBeDefined()
            expect((<StringAttribute>organizationAttrMap.createdAtDate).S).toBeDefined()
            expect((<StringAttribute>organizationAttrMap.createdAtDate).S).toBe(createdAt.toISOString())
          })

          it('lastUpdated', () => {
            expect(organizationAttrMap.lastUpdated).toBeDefined()
            expect((<StringAttribute>organizationAttrMap.lastUpdated).S).toBeDefined()
            expect((<StringAttribute>organizationAttrMap.lastUpdated).S).toBe(lastUpdated.toISOString())
          })

          it('active', () => {
            expect(organizationAttrMap.active).toBeDefined()
            expect((<BooleanAttribute>organizationAttrMap.active).BOOL).toBeDefined()
            expect((<BooleanAttribute>organizationAttrMap.active).BOOL).toBe(true)
          })

          it('count', () => {
            expect(organizationAttrMap.count).toEqual({ N: '52' })
          })

          it('domains', () => {
            expect(organizationAttrMap.domains).toEqual({
              L: ['shiftcode.ch', 'shiftcode.io', 'shiftcode.it'].map((v) => ({ S: v })),
            })
          })

          it('random details', () => {
            expect(organizationAttrMap.randomDetails).toBeDefined()

            const randomDetails = (<ListAttribute>organizationAttrMap.randomDetails).L
            expect(randomDetails).toBeDefined()
            expect(randomDetails.length).toBe(3)

            expect(keyOf(randomDetails[0])).toBe('S')
            expect((<StringAttribute>randomDetails[0]).S).toBe('sample')

            expect(keyOf(randomDetails[1])).toBe('N')
            expect((<NumberAttribute>randomDetails[1]).N).toBe('26')

            expect(keyOf(randomDetails[2])).toBe('BOOL')
            expect((<BooleanAttribute>randomDetails[2]).BOOL).toBe(true)
          })

          it('employees', () => {
            expect(organizationAttrMap.employees).toBeDefined()
            const employeesL = (<ListAttribute>organizationAttrMap.employees).L
            expect(employeesL).toBeDefined()
            expect(employeesL.length).toBe(2)
            expect(employeesL[0]).toBeDefined()
            expect((<MapAttribute>employeesL[0]).M).toBeDefined()

            // test employee1
            const employee1 = (<MapAttribute<Employee>>employeesL[0]).M
            expect(employee1.name).toBeDefined()
            expect((<StringAttribute>employee1.name).S).toBeDefined()
            expect((<StringAttribute>employee1.name).S).toBe('max')
            expect(employee1['age']).toBeDefined()
            expect((<NumberAttribute>employee1.age).N).toBeDefined()
            expect((<NumberAttribute>employee1.age).N).toBe('50')
            expect(employee1['createdAt']).toBeDefined()
            expect((<StringAttribute>employee1.createdAt).S).toBeDefined()
            expect((<StringAttribute>employee1.createdAt).S).toBe(createdAtDateEmployee1.toISOString())

            // test employee2
            const employee2: Attributes<any> = (<MapAttribute>employeesL[1]).M
            expect(employee2['name']).toBeDefined()
            expect((employee2['name'] as StringAttribute).S).toBeDefined()
            expect((employee2['name'] as StringAttribute).S).toBe('anna')
            expect(employee2['age']).toBeDefined()
            expect((employee2['age'] as NumberAttribute).N).toBeDefined()
            expect((employee2['age'] as NumberAttribute).N).toBe('27')
            expect(employee2['createdAt']).toBeDefined()
            expect((employee2['createdAt'] as StringAttribute).S).toBeDefined()
            expect((employee2['createdAt'] as StringAttribute).S).toBe(createdAtDateEmployee2.toISOString())
          })

          it('cities', () => {
            expect(organizationAttrMap.cities).toBeDefined()

            const citiesSS = (<StringSetAttribute>organizationAttrMap.cities).SS
            expect(citiesSS).toBeDefined()
            expect(citiesSS.length).toBe(2)
            expect(citiesSS[0]).toBe('zürich')
            expect(citiesSS[1]).toBe('bern')
          })

          it('birthdays', () => {
            expect(organizationAttrMap.birthdays).toBeDefined()

            const birthdays = (<ListAttribute>organizationAttrMap.birthdays).L
            expect(birthdays).toBeDefined()
            expect(birthdays.length).toBe(2)

            expect(keyOf(birthdays[0])).toBe('M')

            // birthday 1
            const birthday1 = (<MapAttribute<Birthday>>birthdays[0]).M
            expect(birthday1['date']).toBeDefined()
            expect(keyOf(birthday1.date)).toBe('S')
            expect((<StringAttribute>birthday1['date']).S).toBe(birthday1Date.toISOString())

            expect(birthday1.presents).toBeDefined()
            expect(keyOf(birthday1.presents)).toBe('L')
            expect((<ListAttribute>birthday1.presents).L.length).toBe(2)
            expect(keyOf((<ListAttribute>birthday1.presents).L[0])).toBe('M')

            expect(keyOf((<ListAttribute>birthday1.presents).L[0])).toBe('M')

            const birthday1gift1 = (<MapAttribute<Gift>>(<ListAttribute>birthday1.presents).L[0]).M
            expect(birthday1gift1.description).toBeDefined()
            expect(keyOf(birthday1gift1.description)).toBe('S')
            expect((<StringAttribute>birthday1gift1.description).S).toBe('ticket to rome')

            const birthday1gift2 = (<MapAttribute<Gift>>(<ListAttribute>birthday1.presents).L[1]).M
            expect(birthday1gift2.description).toBeDefined()
            expect(keyOf(birthday1gift2.description)).toBe('S')
            expect((<StringAttribute>birthday1gift2.description).S).toBe('camper van')

            // birthday 2
            const birthday2 = (<MapAttribute<Birthday>>birthdays[1]).M
            expect(birthday2.date).toBeDefined()
            expect(keyOf(birthday2.date)).toBe('S')
            expect((<StringAttribute>birthday2.date).S).toBe(birthday2Date.toISOString())

            expect(birthday2.presents).toBeDefined()
            expect(keyOf(birthday2.presents)).toBe('L')
            expect((<ListAttribute>birthday2.presents).L.length).toBe(2)
            expect(keyOf((<ListAttribute>birthday2.presents).L[0])).toBe('M')

            expect(keyOf((<ListAttribute>birthday2.presents).L[0])).toBe('M')

            const birthday2gift1 = (<MapAttribute<Gift>>(<ListAttribute>birthday2.presents).L[0]).M
            expect(birthday2gift1.description).toBeDefined()
            expect(keyOf(birthday2gift1.description)).toBe('S')
            expect((<StringAttribute>birthday2gift1.description).S).toBe('car')

            const birthday2gift2 = (<MapAttribute<Gift>>(<ListAttribute>birthday2.presents).L[1]).M
            expect(birthday2gift2.description).toBeDefined()
            expect(keyOf(birthday2gift2.description)).toBe('S')
            expect((<StringAttribute>birthday2gift2.description).S).toBe('gin')
          })

          it('awards', () => {
            expect(organizationAttrMap.awards).toBeDefined()
            const awards = (<ListAttribute>organizationAttrMap.awards).L
            expect(awards).toBeDefined()
            expect(awards.length).toBe(2)

            expect(keyOf(awards[0])).toBe('S')
            expect((<StringAttribute>awards[0]).S).toBe('good, better, shiftcode')

            expect(keyOf(awards[1])).toBe('S')
            expect((<StringAttribute>awards[1]).S).toBe('just kiddin')
          })

          it('events', () => {
            expect(organizationAttrMap.events).toBeDefined()
            const events = (<ListAttribute>organizationAttrMap.events).L
            expect(events).toBeDefined()
            expect(events.length).toBe(1)

            const event = <MapAttribute<OrganizationEvent>>events[0]

            const eventValue = event.M
            expect(keyOf(event)).toBe('M')
            expect(eventValue.name).toBeDefined()
            expect(keyOf(eventValue.name)).toBe('S')
            expect((<StringAttribute>eventValue.name).S).toBe('shift the web')

            expect(eventValue.participantCount).toBeDefined()
            expect(keyOf(eventValue.participantCount)).toBe('N')
            expect((<NumberAttribute>eventValue.participantCount).N).toBe('1520')
          })

          it('transient', () => {
            expect(organizationAttrMap.transient).toBeUndefined()
          })

          // an empty set is not a valid attribute value to be persisted
          it('emptySet', () => {
            expect(organizationAttrMap.emptySet).toBeUndefined()
            // expect(organizationAttrMap.emptySet).toEqual({ NULL: true })
          })
        })
      })

      describe('model with custom mapper', () => {
        it('should map using the custom mapper', () => {
          const model = new ModelWithCustomMapperModel()
          model.id = new Id(20, 2017)
          const toDbVal: Attributes<ModelWithCustomMapperModel> = toDb(model, ModelWithCustomMapperModel)

          expect(toDbVal.id).toBeDefined()
          expect(keyOf(toDbVal.id)).toBe('S')
          expect((<StringAttribute>toDbVal.id).S).toBe('00202017')
        })
      })

      describe('model with autogenerated value for id', () => {
        it('should create an id', () => {
          const toDbVal = toDb(new ModelWithDefaultValue(), ModelWithDefaultValue)
          expect(toDbVal.id).toBeDefined()
          expect(keyOf(toDbVal.id)).toBe('S')
          expect((<StringAttribute>toDbVal.id).S).toMatch(/^generated-id-\d{1,3}$/)
        })
      })

      describe('model with default value provider AND custom mapper', () => {
        it('should create correct value', () => {
          const toDbVal = toDb(new ModelWithCustomMapperAndDefaultValue(), ModelWithCustomMapperAndDefaultValue)
          expect(toDbVal.myProp).toBeDefined()
          expect(keyOf(toDbVal.myProp)).toBe('S')
          expect((<StringAttribute>toDbVal.myProp).S).toBe(MyProp.default().toString())
        })
      })

      describe('model with combined decorators', () => {
        const toDbValue: SimpleWithRenamedPartitionKeyModel = { id: 'idValue', age: 30 }
        const mapped = toDb(toDbValue, SimpleWithRenamedPartitionKeyModel)
        expect(mapped).toEqual({ custom_id: { S: 'idValue' }, age: { N: '30' } })
      })

      describe('model with non string/number/binary keys', () => {
        it('should accept date as HASH or RANGE key', () => {
          const now = new Date()
          const toDbVal: Record<string, DynamoDB.AttributeValue> = toDb(
            new ModelWithDateAsHashKey(now),
            ModelWithDateAsHashKey,
          )
          expect(toDbVal.startDate.S).toBeDefined()
          expect(toDbVal.startDate.S).toEqual(now.toISOString())
        })
        it('should accept date as HASH or RANGE key on GSI', () => {
          const now = new Date()
          const toDbVal: Record<string, DynamoDB.AttributeValue> = toDb(
            new ModelWithDateAsIndexHashKey(0, now),
            ModelWithDateAsIndexHashKey,
          )
          expect(toDbVal.creationDate.S).toBeDefined()
          expect(toDbVal.creationDate.S).toEqual(now.toISOString())
        })
        it('should throw error when no custom mapper was defined', () => {
          expect(() => {
            toDb(new ModelWithoutCustomMapper('key', 'value', 'otherValue'), ModelWithoutCustomMapper)
          }).toThrow()

          expect(() => {
            toDb(new ModelWithoutCustomMapperOnIndex('id', 'key', 'value'), ModelWithoutCustomMapperOnIndex)
          }).toThrow()
        })
      })

      describe('model with complex property values (decorators)', () => {
        let toDbVal: Attributes<Product>

        beforeEach(() => {
          toDbVal = toDb(new Product(), Product)
        })

        it('nested value', () => {
          const nested = <MapAttribute<NestedComplexModel>>toDbVal.nestedValue
          expect(toDbVal.nestedValue).toBeDefined()
          expect(nested.M).toBeDefined()
          expect(Object.keys(nested.M).length).toBe(1)

          expect(nested.M.sortedSet).toBeDefined()
          expect(keyOf(nested.M.sortedSet)).toBe('L')
        })

        it('list', () => {
          const list = <ListAttribute>toDbVal.list
          expect(list).toBeDefined()
          expect(keyOf(list)).toBe('L')
          expect(list.L.length).toBe(1)
          expect(keyOf(list.L[0])).toBe('M')
          // expect(Object.keys(toDb.list.L[0].M).length).toBe(1);
          const productNested = (<MapAttribute<ProductNested>>list.L[0]).M
          expect(productNested.collection).toBeDefined()
          expect(keyOf(productNested.collection)).toBe('L')
        })
      })

      describe('model with nested model with custom mapper', () => {
        const object = new ModelWithNestedModelWithCustomMapper()
        const toDbVal: Attributes<ModelWithNestedModelWithCustomMapper> = toDb(
          object,
          ModelWithNestedModelWithCustomMapper,
        )

        it('custom mapper', () => {
          expect(toDbVal).toBeDefined()
          expect(toDbVal.nestedModel).toBeDefined()
          const nestedModel = <MapAttribute<NestedModelWithCustomMapper>>toDbVal.nestedModel
          expect(nestedModel.M.id).toEqual(IdMapper.toDb(object.nestedModel.id))
        })
      })

      describe('model with enums', () => {
        const object = new ModelWithNonDecoratedEnum()
        object.id = 'myId'
        object.type = Type.FirstType
        object.strType = StringType.FirstType

        const toDbVal: Attributes<ModelWithNonDecoratedEnum> = toDb(object, ModelWithNonDecoratedEnum)

        it('should map all properties', () => {
          expect(toDbVal).toBeDefined()

          expect(toDbVal.id).toBeDefined()
          expect((<StringAttribute>toDbVal.id).S).toBe('myId')

          expect(toDbVal.type).toBeDefined()
          expect((<NumberAttribute>toDbVal.type).N).toBe('0')

          expect(toDbVal.strType).toBeDefined()
          expect((<StringAttribute>toDbVal.strType).S).toBe('first')
        })
      })

      describe('model with empty values', () => {
        const model: ModelWithEmptyValues = {
          // OK
          id: 'myId',

          // x -> empty strings are valid
          name: '',

          // x -> empty set is not valid
          roles: new Set(),

          // OK ->empty L(ist) is valid
          lastNames: [],

          // OK -> depending on mapper
          createdAt: new Date(),

          // OK -> empty M(ap) is valid
          details: {},
        }

        const toDbValue = toDb(model, ModelWithEmptyValues)

        // expect(Object.keys(toDbValue).length).toBe(4)

        expect(toDbValue.id).toBeDefined()
        expect(keyOf(toDbValue.id)).toBe('S')

        expect(toDbValue.name).toBeDefined()
        expect(keyOf(toDbValue.name)).toBe('S')

        expect(toDbValue.roles).toBeUndefined()

        expect(toDbValue.lastNames).toBeDefined()
        expect(keyOf(toDbValue.lastNames)).toBe('L')

        expect(toDbValue.createdAt).toBeDefined()

        expect(toDbValue.details).toBeDefined()
        expect(keyOf(toDbValue.details)).toBe('M')
      })
    })

    describe('from db', () => {
      describe('model with complex property values (decorators)', () => {
        let product: Product

        beforeEach(() => {
          product = fromDb(productFromDb, Product)
        })

        it('nested value', () => {
          expect(product.nestedValue).toBeDefined()
          expect(Object.getOwnPropertyNames(product.nestedValue).length).toBe(1)
          expect(product.nestedValue.sortedSet).toBeDefined()
          expect(product.nestedValue.sortedSet instanceof Set).toBeTruthy()
          expect(product.nestedValue.sortedSet.size).toBe(2)
        })
      })

      describe('model', () => {
        let organization: Organization

        beforeEach(() => {
          organization = fromDb(organizationFromDb, Organization)
        })

        it('id', () => {
          expect(organization.id).toBe('myId')
        })

        it('createdAtDate', () => {
          expect(organization.createdAtDate).toBeDefined()
          expect(organization.createdAtDate instanceof Date).toBeTruthy()
          expect(isNaN(<any>organization.createdAtDate)).toBeFalsy()
          expect(organization.createdAtDate.toISOString()).toEqual(organization1CreatedAt.toISOString())
        })

        it('lastUpdated', () => {
          expect(organization.lastUpdated).toBeDefined()
          expect(organization.lastUpdated instanceof Date).toBeTruthy()
          expect(isNaN(<any>organization.lastUpdated)).toBeFalsy()
          expect(organization.lastUpdated.toISOString()).toEqual(organization1LastUpdated.toISOString())
        })

        it('employees', () => {
          expect(organization.employees).toBeDefined()
          expect(Array.isArray(organization.employees)).toBeTruthy()
          expect(organization.employees.length).toBe(2)

          // first employee
          expect(organization.employees[0].name).toBe('max')
          expect(organization.employees[0].age).toBe(50)
          expect(organization.employees[0].createdAt instanceof Date).toBeTruthy()
          expect(isNaN(<any>organization.employees[0].createdAt)).toBeFalsy()
          expect((<Date>organization.employees[0].createdAt).toISOString()).toEqual(
            organization1Employee1CreatedAt.toISOString(),
          )

          // set is mapped to set but would expect list, should not work without extra @Sorted() decorator
          expect(organization.employees[0].sortedSet).toBeDefined()
          expect(organization.employees[0].sortedSet instanceof Set).toBeTruthy()

          // second employee
          expect(organization.employees[1].name).toBe('anna')
          expect(organization.employees[1].age).toBe(27)
          expect(organization.employees[1].createdAt instanceof Date).toBeTruthy()
          expect(isNaN(<any>organization.employees[1].createdAt)).toBeFalsy()
          expect(organization.employees[1].createdAt).toEqual(organization1Employee2CreatedAt)
          expect(organization.employees[1].sortedSet).toBeDefined()
          expect(organization.employees[1].sortedSet instanceof Set).toBeTruthy()
        })

        it('active', () => {
          expect(organization.active).toBe(true)
        })

        it('count', () => {
          expect(organization.count).toBe(52)
        })

        it('cities', () => {
          expect(organization.cities).toBeDefined()
          expect(organization.cities instanceof Set).toBeTruthy()

          const cities: Set<string> = organization.cities
          expect(cities.size).toBe(2)
          expect(Array.from(cities)[0]).toBe('zürich')
          expect(Array.from(cities)[1]).toBe('bern')
        })

        it('birthdays', () => {
          expect(organization.birthdays).toBeDefined()
          expect(organization.birthdays instanceof Set).toBeTruthy()

          const birthdays: Set<Birthday> = organization.birthdays
          expect(birthdays.size).toBe(1)

          const birthday: Birthday = Array.from(birthdays)[0]
          expect(birthday).toBeDefined()
          expect(birthday.date).toEqual(new Date('1958-04-13'))
          expect(Array.isArray(birthday.presents)).toBeTruthy()
        })

        it('awards', () => {
          expect(organization.awards).toBeDefined()
          expect(organization.awards instanceof Set).toBeTruthy()

          const awards = organization.awards
          expect(awards.size).toBe(1)
          const award = Array.from(awards)[0]

          expect(award).toBeDefined()
          expect(award).toBe('Best of Swiss Web')
        })

        it('events', () => {
          expect(organization.events).toBeDefined()
          expect(organization.events instanceof Set).toBeTruthy()

          const events = organization.events
          expect(events.size).toBe(1)

          const event = Array.from(events)[0]

          expect(event).toBeDefined()
          expect(typeof event).toBe('object')
          expect(event.name).toBe('yearly get together')
          expect(event.participants).toBe(125)
        })
      })

      describe('model with enums', () => {
        const attributes: Attributes<ModelWithNonDecoratedEnum> = {
          id: { S: 'myId' },
          type: { N: Type.FirstType.toString() },
          strType: { S: StringType.FirstType },
        }

        const fromDbVal: ModelWithNonDecoratedEnum = fromDb(attributes, ModelWithNonDecoratedEnum)

        it('should map all properties', () => {
          expect(fromDbVal).toBeDefined()

          expect(fromDbVal.id).toBeDefined()
          expect(fromDbVal.id).toBe('myId')

          expect(fromDbVal.type).toBeDefined()
          expect(fromDbVal.type).toBe(Type.FirstType)

          expect(fromDbVal.strType).toBeDefined()
          expect(fromDbVal.strType).toBe(StringType.FirstType)
        })
      })
    })
  })

  describe('createKeyAttributes', () => {
    it('PartitionKey only', () => {
      const attrs = createKeyAttributes(metadataForModel(SimpleWithPartitionKeyModel), 'myId')
      expect(attrs).toEqual({
        id: { S: 'myId' },
      })
    })

    it('PartitionKey only (custom db name)', () => {
      const attrs = createKeyAttributes(metadataForModel(SimpleWithRenamedPartitionKeyModel), 'myId')
      expect(attrs).toEqual({
        custom_id: { S: 'myId' },
      })
    })

    it('PartitionKey + SortKey', () => {
      const now = new Date()
      const attrs = createKeyAttributes(metadataForModel(SimpleWithCompositePartitionKeyModel), 'myId', now)
      expect(attrs).toEqual({
        id: { S: 'myId' },
        creationDate: { S: now.toISOString() },
      })
    })

    it('PartitionKey + SortKey (custom db name)', () => {
      const now = new Date()
      const attrs = createKeyAttributes(metadataForModel(SimpleWithRenamedCompositePartitionKeyModel), 'myId', now)
      expect(attrs).toEqual({
        custom_id: { S: 'myId' },
        custom_date: { S: now.toISOString() },
      })
    })

    it('should throw when required sortKey is missing', () => {
      expect(() => createKeyAttributes(metadataForModel(SimpleWithCompositePartitionKeyModel), 'myId')).toThrow()
    })
  })

  describe('createToKeyFn, toKey', () => {
    it('should throw when model has no defined properties', () => {
      expect(() => createToKeyFn(SimpleModel)).toThrow()
    })

    it('should throw when given partial has undefined key properties', () => {
      expect(() => toKey(<any>{}, SimpleWithPartitionKeyModel)).toThrow()
      expect(() => toKey(<any>{ id: 'myId' }, SimpleWithCompositePartitionKeyModel)).toThrow()
      expect(() => toKey(<any>{ creationDate: new Date() }, SimpleWithCompositePartitionKeyModel)).toThrow()
    })

    it('should create key attributes of simple key', () => {
      const key = toKey(<any>{ id: 'myId' }, SimpleWithPartitionKeyModel)
      expect(key).toEqual({
        id: { S: 'myId' },
      })
    })

    it('should create key attributes of simple key (custom db name)', () => {
      const key = toKey(<any>{ id: 'myId' }, SimpleWithRenamedPartitionKeyModel)
      expect(key).toEqual({
        custom_id: { S: 'myId' },
      })
    })

    it('should create key attributes of composite key', () => {
      const partial: Partial<SimpleWithCompositePartitionKeyModel> = { id: 'myId', creationDate: new Date() }
      const key = toKey(partial, SimpleWithCompositePartitionKeyModel)
      expect(key).toEqual({
        id: { S: partial.id! },
        creationDate: { S: partial.creationDate!.toISOString() },
      })
    })

    it('should create key attributes of composite key (custom db name)', () => {
      const partial: Partial<SimpleWithRenamedCompositePartitionKeyModel> = { id: 'myId', creationDate: new Date() }
      const key = toKey(partial, SimpleWithRenamedCompositePartitionKeyModel)
      expect(key).toEqual({
        custom_id: { S: partial.id! },
        custom_date: { S: partial.creationDate!.toISOString() },
      })
    })

    it('should create key with custom mapper', () => {
      const partial: ModelWithCustomMapperModel = { id: new Id(7, 2018) }
      const key = toKey(partial, ModelWithCustomMapperModel)
      expect(key).toEqual({
        id: { S: Id.unparse(partial.id) },
      })
    })
  })
})

function keyOf(attributeValue: Attribute): string | null {
  if (attributeValue && Object.keys(attributeValue).length) {
    return Object.keys(attributeValue)[0]
  } else {
    return null
  }
}
