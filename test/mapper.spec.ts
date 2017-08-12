import { AttributeValue, AttributeValueList, MapAttributeValue, NumberSetAttributeValue, StringSetAttributeValue } from 'aws-sdk/clients/dynamodb'
import moment from 'moment'
import 'moment/locale/de-ch'
import { AttributeMap } from '../attribute-map.type'
import { Mapper } from '../src/mapper/mapper'
import {
  organization1CreatedAt,
  organization1Employee1CreatedAt,
  organization1Employee2CreatedAt,
  organization1LastUpdated,
  organizationFromDb
} from './data/organization-dynamodb.data'
import { Employee } from './models/employee.model'
import { Organization } from './models/organization.model'

describe('Mapper', () => {
  describe('should map single values', () => {
    describe('to db', () => {
      it('string', () => {
        let attrValue: AttributeValue = Mapper.mapToDbOne('foo')
        expect(attrValue).toBeDefined()
        expect(attrValue.S).toBeDefined()
        expect(attrValue.S).toBe('foo')
      })

      it('number', () => {
        let attrValue: AttributeValue = Mapper.mapToDbOne(3)
        expect(attrValue).toBeDefined()
        expect(keyOf(attrValue)).toBe('N')
        expect(attrValue.N).toBe('3')
      })

      it('boolean', () => {
        let attrValue: AttributeValue = Mapper.mapToDbOne(false)
        expect(attrValue).toBeDefined()
        expect(keyOf(attrValue)).toBe('BOOL')
        expect(attrValue.BOOL).toBe(false)
      })

      it('null', () => {
        let attrValue: AttributeValue = Mapper.mapToDbOne(null)
        expect(attrValue).toBeDefined()
        expect(keyOf(attrValue)).toBe('NULL')
        expect(attrValue.NULL).toBe(true)
      })

      it('array -> SS (homogen, no duplicates)', () => {
        let attrValue: AttributeValue = Mapper.mapToDbOne(['foo', 'bar'])
        expect(attrValue).toBeDefined()
        expect(keyOf(attrValue)).toBe('SS')
        expect(attrValue.SS[0]).toBe('foo')
        expect(attrValue.SS[1]).toBe('bar')
      })

      // TODO should we handle arrays with duplicates as list, or throw an error
      // it('array (homogen, duplicates)', () => {
      //   let attrValue: AttributeValue = Mapper.mapToDbOne(['foo', 'bar', 'foo']);
      //   expect(attrValue).toBeDefined();
      //   expect(keyOf(attrValue)).toBe('L');
      //   expect(attrValue.L).toBeDefined();
      //   expect(attrValue.L.length).toBe(3);
      //   const foo: AttributeValue = attrValue.L[0];
      //   expect(foo).toBeDefined();
      //   expect(keyOf(foo)).toBe('S');
      //   expect(foo.S).toBe('foo');
      // });

      it('array -> L (heterogen, no duplicates)', () => {
        let attrValue: AttributeValue = Mapper.mapToDbOne(['foo', 56, true])
        expect(attrValue).toBeDefined()
        expect(keyOf(attrValue)).toBe('L')
        expect(attrValue.L).toBeDefined()
        expect(attrValue.L.length).toBe(3)

        const foo: AttributeValue = attrValue.L[0]
        expect(foo).toBeDefined()
        expect(keyOf(foo)).toBe('S')
        expect(foo.S).toBe('foo')

        const no: AttributeValue = attrValue.L[1]
        expect(no).toBeDefined()
        expect(keyOf(no)).toBe('N')
        expect(no.N).toBe('56')

        const bool: AttributeValue = attrValue.L[2]
        expect(bool).toBeDefined()
        expect(keyOf(bool)).toBe('BOOL')
        expect(bool.BOOL).toBe(true)
      })

      it('array -> L (homogen, complex type)', () => {
        let attrValue: AttributeValue = Mapper.mapToDbOne([new Employee('max', 25, moment()), new Employee('anna', 65, moment())])

        expect(attrValue).toBeDefined()
        expect(keyOf(attrValue)).toBe('L')

        const employee1 = attrValue.L[0]
        expect(employee1).toBeDefined()
        expect(keyOf(employee1)).toBe('M')
        expect(Object.keys(employee1.M).length).toBe(3)
        expect(employee1.M['name']).toBeDefined()
        expect(keyOf(employee1.M['name'])).toBe('S')
        expect(employee1.M['name']['S']).toBe('max')

        expect(employee1.M['age']).toBeDefined()
        expect(keyOf(employee1.M['age'])).toBe('N')
        expect(employee1.M['age']['N']).toBe('25')
        // TODO test for moment date
      })

      it('set', () => {
        let attrValue: AttributeValue = Mapper.mapToDbOne(new Set(['foo', 'bar', 25]))
        expect(attrValue).toBeDefined()
        expect(keyOf(attrValue)).toBe('SS')
        expect(attrValue.SS[0]).toBe('foo')
        expect(attrValue.SS[1]).toBe('bar')
      })

      it('set of employees', () => {
        const cd: moment.Moment = moment('2017-02-03', 'YYYY-MM-DD')
        const cd2: moment.Moment = moment('2017-02-28', 'YYYY-MM-DD')
        let attrValue: AttributeValue = Mapper.mapToDbOne(
          new Set([<Employee>{ name: 'foo', age: 56, createdAt: cd }, <Employee>{ name: 'anna', age: 26, createdAt: cd2 }])
        )

        expect(attrValue).toBeDefined()
        expect(keyOf(attrValue)).toBe('L')
        expect(attrValue.L.length).toBe(2)
        expect(attrValue.L[0].M).toBeDefined()
        expect(attrValue.L[0].M['name']).toBeDefined()
        expect(keyOf(attrValue.L[0].M['name'])).toBe('S')
        expect(attrValue.L[0].M['name'].S).toBe('foo')
      })

      it('object (Employee created using Object literal)', () => {
        const cr: moment.Moment = moment('2017-03-03', 'YYYY-MM-DD')
        let attrValue: AttributeValue = Mapper.mapToDbOne(<Employee>{ name: 'foo', age: 56, createdAt: cr })
        expect(attrValue).toBeDefined()
        expect(keyOf(attrValue)).toBe('M')

        // name
        expect(attrValue.M['name']).toBeDefined()
        expect(keyOf(attrValue.M['name'])).toBe('S')
        expect(attrValue.M['name'].S).toBe('foo')

        // age
        expect(attrValue.M['age']).toBeDefined()
        expect(keyOf(attrValue.M['age'])).toBe('N')
        expect(attrValue.M['age'].N).toBe('56')

        // createdAt
        expect(attrValue.M['createdAt']).toBeDefined()
        expect(keyOf(attrValue.M['createdAt'])).toBe('S')
        expect(attrValue.M['createdAt'].S).toBe(cr.clone().utc().format(moment.defaultFormat))
      })

      it('object (Employee created using constructor)', () => {
        const cr: moment.Moment = moment('2017-05-03', 'YYYY-MM-DD')
        let attrValue: AttributeValue = Mapper.mapToDbOne(new Employee('foo', 56, cr))
        expect(attrValue).toBeDefined()
        expect(keyOf(attrValue)).toBe('M')

        // name
        expect(attrValue.M['name']).toBeDefined()
        expect(keyOf(attrValue.M['name'])).toBe('S')
        expect(attrValue.M['name'].S).toBe('foo')

        // age
        expect(attrValue.M['age']).toBeDefined()
        expect(keyOf(attrValue.M['age'])).toBe('N')
        expect(attrValue.M['age'].N).toBe('56')

        // createdAt
        expect(attrValue.M['createdAt']).toBeDefined()
        expect(keyOf(attrValue.M['createdAt'])).toBe('S')
        expect(attrValue.M['createdAt'].S).toBe(cr.clone().utc().format(moment.defaultFormat))
      })
    })

    describe('from db', () => {
      it('string', () => {
        const attrValue = { S: 'foo' }
        const stringValue = Mapper.mapFromDbOne(attrValue)
      })
    })
  })

  describe('to db model object literal (non-new)', () => {
    let organization: Organization
    let organizationAttrMap: AttributeMap<Organization>
    let createdAt: moment.Moment
    let createdAtDateEmployee1: moment.Moment
    let createdAtDateEmployee2: moment.Moment

    beforeEach(() => {
      organization = <any>{}
      organization.id = 'myId'
      createdAt = moment()
      organization.createdAtDate = createdAt

      const employees: Employee[] = []
      createdAtDateEmployee1 = moment('2017-03-05', 'YYYY-MM-DD')
      createdAtDateEmployee2 = moment()

      employees.push({
        name: 'max',
        age: 50,
        createdAt: createdAtDateEmployee1
      })
      employees.push({
        name: 'anna',
        age: 27,
        createdAt: createdAtDateEmployee2
      })
      organization.employees = employees

      organization.active = true
      organization.count = 52
      organization.cities = new Set(['zürich', 'bern'])
      organization.awardWinningYears = new Set([2002, 2015, 2017])

      organization.mixedList = ['sample', 26, true]

      // let birthdays: Map<string, string> = new Map();
      // birthdays.set('max', '12.12.1954');
      // birthdays.set('anna', '03.05.1980');
      // organization.birthdays = birthdays;

      organization.transient = 'the value which is marked as transient'

      organizationAttrMap = Mapper.mapToDb(organization, Organization)
    })

    it('all properties are mapped', () => {
      expect(Object.keys(organizationAttrMap).length).toBe(8)
    })

    it('id', () => {
      expect(organizationAttrMap.id).toEqual({ S: 'myId' })
    })

    it('createdAt', () => {
      expect(organizationAttrMap.createdAtDate).toBeDefined()
      expect(organizationAttrMap.createdAtDate.S).toBeDefined()
      expect(organizationAttrMap.createdAtDate.S).toBe(createdAt.clone().utc().format(moment.defaultFormat))
    })

    it('employees', () => {
      expect(organizationAttrMap.employees).toBeDefined()
      let employeesL: AttributeValueList = organizationAttrMap.employees.L
      expect(employeesL).toBeDefined()
      expect(employeesL.length).toBe(2)
      expect(employeesL[0]).toBeDefined()
      expect(employeesL[0].M).toBeDefined()

      // test employee1
      let employee1: MapAttributeValue = employeesL[0].M
      expect(employee1['name']).toBeDefined()
      expect(employee1['name'].S).toBeDefined()
      expect(employee1['name'].S).toBe('max')
      expect(employee1['age']).toBeDefined()
      expect(employee1['age'].N).toBeDefined()
      expect(employee1['age'].N).toBe('50')
      expect(employee1['createdAt']).toBeDefined()
      expect(employee1['createdAt'].S).toBeDefined()
      expect(employee1['createdAt'].S).toBe(createdAtDateEmployee1.clone().utc().format(moment.defaultFormat))
    })
  })

  describe('to db model class created with new', () => {
    let organization: Organization
    let organizationAttrMap: AttributeMap<Organization>
    let createdAt: moment.Moment
    let createdAtDateEmployee1: moment.Moment
    let createdAtDateEmployee2: moment.Moment

    beforeEach(() => {
      organization = new Organization()
      organization.id = 'myId'
      createdAt = moment()
      organization.createdAtDate = createdAt

      const employees: Employee[] = []
      createdAtDateEmployee1 = moment('2017-03-05', 'YYYY-MM-DD')
      createdAtDateEmployee2 = moment()

      employees.push(new Employee('max', 50, createdAtDateEmployee1))
      employees.push(new Employee('anna', 27, createdAtDateEmployee2))
      organization.employees = employees

      organization.active = true
      organization.count = 52
      organization.cities = new Set(['zürich', 'bern'])
      organization.awardWinningYears = new Set([2002, 2015, 2017])

      organization.mixedList = ['sample', 26, true]

      // let birthdays: Map<string, string> = new Map();
      // birthdays.set('max', '12.12.1954');
      // birthdays.set('anna', '03.05.1980');
      // organization.birthdays = birthdays;

      organization.transient = 'the value which is marked as transient'

      organizationAttrMap = Mapper.mapToDb(organization, Organization)
    })

    describe('creates correct attribute map', () => {
      it('all properties are mapped', () => {
        expect(Object.keys(organizationAttrMap).length).toBe(8)
      })

      it('id', () => {
        expect(organizationAttrMap.id).toEqual({ S: 'myId' })
      })

      it('createdAt', () => {
        expect(organizationAttrMap.createdAtDate).toBeDefined()
        expect(organizationAttrMap.createdAtDate.S).toBeDefined()
        expect(organizationAttrMap.createdAtDate.S).toBe(createdAt.clone().utc().format(moment.defaultFormat))
      })

      it('employees', () => {
        expect(organizationAttrMap.employees).toBeDefined()
        let employeesL: AttributeValueList = organizationAttrMap.employees.L
        expect(employeesL).toBeDefined()
        expect(employeesL.length).toBe(2)
        expect(employeesL[0]).toBeDefined()
        expect(employeesL[0].M).toBeDefined()

        // test employee1
        let employee1: MapAttributeValue = employeesL[0].M
        expect(employee1['name']).toBeDefined()
        expect(employee1['name'].S).toBeDefined()
        expect(employee1['name'].S).toBe('max')
        expect(employee1['age']).toBeDefined()
        expect(employee1['age'].N).toBeDefined()
        expect(employee1['age'].N).toBe('50')
        expect(employee1['createdAt']).toBeDefined()
        expect(employee1['createdAt'].S).toBeDefined()
        expect(employee1['createdAt'].S).toBe(createdAtDateEmployee1.clone().utc().format(moment.defaultFormat))
      })

      it('active', () => {
        expect(organizationAttrMap.active).toBeDefined()
        expect(organizationAttrMap.active.BOOL).toBeDefined()
        expect(organizationAttrMap.active.BOOL).toBe(true)
      })

      it('count', () => {
        expect(organizationAttrMap.count).toEqual({ N: '52' })
      })

      it('cities', () => {
        expect(organizationAttrMap.cities).toBeDefined()

        let citiesSS: StringSetAttributeValue = organizationAttrMap.cities.SS
        expect(citiesSS).toBeDefined()
        expect(citiesSS.length).toBe(2)
        expect(citiesSS[0]).toBe('zürich')
        expect(citiesSS[1]).toBe('bern')
      })

      it('awardWinningYears', () => {
        expect(organizationAttrMap.awardWinningYears).toBeDefined()
        let awardWinningYearsNS: NumberSetAttributeValue = organizationAttrMap.awardWinningYears.NS
        expect(awardWinningYearsNS).toBeDefined()
        expect(awardWinningYearsNS.length).toBe(3)
        let years: string[] = Array.from(organization.awardWinningYears).map(year => `${year}`)
        expect(awardWinningYearsNS[0]).toBe(years[0])
        expect(awardWinningYearsNS[1]).toBe(years[1])
        expect(awardWinningYearsNS[2]).toBe(years[2])
      })

      it('transient', () => {
        expect(organizationAttrMap.transient).toBeUndefined()
      })
    })
  })

  describe('from db', () => {
    let organization: Organization

    beforeEach(() => {
      organization = Mapper.mapFromDb(organizationFromDb, Organization)
    })

    it('id', () => {
      expect(organization.id).toBe('myId')
    })

    it('createdAtDate', () => {
      expect(organization.createdAtDate).toBeDefined()
      expect(moment.isMoment(organization.createdAtDate)).toBeTruthy()
      expect((<moment.Moment>organization.createdAtDate).isValid()).toBeTruthy()
      expect((<moment.Moment>organization.createdAtDate).isSame(organization1CreatedAt)).toBeTruthy()
    })

    it('lastUpdated', () => {
      expect(organization.lastUpdated).toBeDefined()
      expect(moment.isMoment(organization.lastUpdated)).toBeTruthy()
      expect((<moment.Moment>organization.lastUpdated).isValid()).toBeTruthy()
      expect((<moment.Moment>organization.lastUpdated).isSame(organization1LastUpdated)).toBeTruthy()
    })

    it('employees', () => {
      expect(organization.employees).toBeDefined()
      expect(Array.isArray(organization.employees)).toBeTruthy()
      expect(organization.employees.length).toBe(2)

      // first employee
      expect(organization.employees[0].name).toBe('max')
      expect(organization.employees[0].age).toBe(50)
      expect(moment.isMoment(organization.employees[0].createdAt)).toBeTruthy()
      expect((<moment.Moment>organization.employees[0].createdAt).isSame(organization1Employee1CreatedAt)).toBeTruthy()

      // second employee
      expect(organization.employees[1].name).toBe('anna')
      expect(organization.employees[1].age).toBe(27)
      expect(moment.isMoment(organization.employees[1].createdAt)).toBeTruthy()
      expect((<moment.Moment>organization.employees[1].createdAt).isSame(organization1Employee2CreatedAt)).toBeTruthy()
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

    xit('awardWinningYears', () => {})

    xit('mixedList', () => {})
  })
})

function keyOf(attributeValue: AttributeValue): string | null {
  if (attributeValue && Object.keys(attributeValue).length) {
    return Object.keys(attributeValue)[0]
  } else {
    return null
  }
}
