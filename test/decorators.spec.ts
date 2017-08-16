import { ScDynamoObjectMapper } from "../src/sc-dynamo-object-mapper"
import { ModelWithDate } from "./models/model-with-date.model"
import { ModelWithDateMoment } from "./models/model-with-date-moment.model"
import { ComplexModel, NestedObject } from "./models/complex.model"
import { SimpleModel } from "./models/simple.model"
import { CustomTableNameModel } from "./models/custom-table-name.model"
import { Moment } from "../src/decorator/moment.type"
import moment from "moment"
import { MetadataHelper } from "../src/decorator/metadata"
import { ModelMetadata } from "../src/decorator/model-metadata.model"
import { PropertyMetadata } from "../src/decorator/property-metadata.model"

describe("Decorators should add correct metadata", () => {
  describe("for simple model", () => {
    let modelOptions: ModelMetadata<SimpleModel>

    beforeEach(() => {
      modelOptions = MetadataHelper.get(SimpleModel).modelOptions
    })

    it("with default table name", () => {
      expect(modelOptions).toBeDefined()
      expect(modelOptions.tableName).toBe("simple-model")
      expect(modelOptions.clazz).toBe(SimpleModel)
      expect(modelOptions.clazzName).toBe("SimpleModel")
    })

    it("with no properties", () => {
      expect(modelOptions.properties).toBeUndefined()
    })
  })

  describe("for custom table name", () => {
    let modelOptions: ModelMetadata<CustomTableNameModel>

    beforeEach(() => {
      modelOptions = MetadataHelper.get(CustomTableNameModel).modelOptions
    })

    it("with custom table name", () => {
      expect(modelOptions).toBeDefined()
      expect(modelOptions.tableName).toBe("myCustomName")
      expect(modelOptions.clazz).toBe(CustomTableNameModel)
      expect(modelOptions.clazzName).toBe("CustomTableNameModel")
    })
  })

  // FIXME cannot set the dateType temporary for these test block
  // describe('for model with dates (type Date)', ()=>{
  //   let modelOptions: ModelMetadata;
  //
  //   beforeEach(() => {
  //     ScDynamoObjectMapper.config.dateType = 'default';
  //     modelOptions = MetadataHelper.get(ModelWithDate).modelOptions;
  //   });
  //
  //   it('id', ()=>{
  //     let prop: PropertyMetadata = getProperty(modelOptions, 'id');
  //     expect(prop).toBeDefined();
  //     expect(prop.key).toBe('id');
  //     expect(prop.name).toBe('id');
  //     expect(prop.partitionKey).toBeTruthy();
  //     expect(prop.sortKey).toBeFalsy();
  //     expect(prop.customType).toBeFalsy();
  //     expect(prop.transient).toBeFalsy();
  //     expect(prop.type).toBe(String);
  //     expect(prop.typeName).toBe('String');
  //   })
  //
  //   it('creationDate', ()=>{
  //     let prop: PropertyMetadata = getProperty(modelOptions, 'creationDate');
  //     expect(prop).toBeDefined();
  //     expect(prop.key).toBe('creationDate');
  //     expect(prop.name).toBe('creationDate');
  //     expect(prop.partitionKey).toBeFalsy();
  //     expect(prop.sortKey).toBeTruthy();
  //     expect(prop.customType).toBeTruthy();
  //     expect(prop.transient).toBeFalsy();
  //     expect(prop.type).toBe(Date);
  //   })
  // })

  describe("for model with dates (type MomentJS)", () => {
    let modelOptions: ModelMetadata<ModelWithDateMoment>

    beforeEach(() => {
      modelOptions = MetadataHelper.get(ModelWithDateMoment).modelOptions
    })

    it("id", () => {
      let prop = getProperty(modelOptions, "id")
      expect(prop).toBeDefined()
      expect(prop.name).toBe("id")
      expect(prop.nameDb).toBe("id")
      expect(prop.key).toBeDefined()
      expect(prop.key.type).toBe("HASH")
      expect(prop.key.uuid).toBeFalsy()
      expect(prop.transient).toBeFalsy()
      expect(prop.typeInfo).toBeDefined()
      expect(prop.typeInfo.isCustom).toBeFalsy()
      expect(prop.typeInfo.type).toBe(String)
    })

    it("creationDate", () => {
      let prop = getProperty(modelOptions, "creationDate")
      expect(prop).toBeDefined()
      expect(prop.name).toBe("creationDate")
      expect(prop.nameDb).toBe("creationDate")
      expect(prop.key).toBeDefined()
      expect(prop.key.type).toBe("RANGE")
      expect(prop.key.uuid).toBeFalsy()
      expect(prop.transient).toBeFalsy()
      expect(prop.typeInfo).toBeDefined()
      expect(prop.typeInfo.isCustom).toBeTruthy()
      expect(prop.typeInfo.type).toBe(Moment)
    })

    it("lastUpdated", () => {
      let prop = getProperty(modelOptions, "lastUpdated")
      expect(prop).toBeDefined()
      expect(prop.name).toBe("lastUpdated")
      expect(prop.nameDb).toBe("lastUpdated")
      expect(prop.key).toBeUndefined()
      expect(prop.transient).toBeFalsy()
      expect(prop.typeInfo).toBeDefined()
      expect(prop.typeInfo.isCustom).toBeTruthy()
      expect(prop.typeInfo.type).toBe(Moment)
    })
  })

  describe("for complex model", () => {
    let modelOptions: ModelMetadata<ComplexModel>

    beforeEach(() => {
      modelOptions = MetadataHelper.get(ComplexModel).modelOptions
    })

    it("with default model metadata", () => {
      expect(modelOptions.tableName).toBe("complex_model")
      expect(modelOptions.clazz).toBe(ComplexModel)
      expect(modelOptions.clazzName).toBe("ComplexModel")
    })

    it("with correct properties", () => {
      expect(modelOptions.properties).toBeDefined()
      expect(modelOptions.properties.length).toBe(10)
    })

    it("with correct transient properties", () => {
      expect(modelOptions.transientProperties).toBeDefined()
      expect(modelOptions.transientProperties.length).toBe(1)
    })

    describe("with correct property metdata", () => {
      it("ids", () => {
        let prop = getProperty(modelOptions, "id")
        expect(prop).toBeDefined()
        expect(prop.name).toBe("id")
        expect(prop.nameDb).toBe("id")
        expect(prop.key).toBeDefined()
        expect(prop.key.type).toBe("HASH")
        expect(prop.key.uuid).toBeFalsy()
        expect(prop.transient).toBeFalsy()
        expect(prop.typeInfo).toBeDefined()
        expect(prop.typeInfo.isCustom).toBeFalsy()
        expect(prop.typeInfo.type).toBe(String)
      })

      it("creationDate", () => {
        let prop = getProperty(modelOptions, "creationDate")
        expect(prop).toBeDefined()
        expect(prop.name).toBe("creationDate")
        expect(prop.nameDb).toBe("creationDate")
        expect(prop.key).toBeDefined()
        expect(prop.key.type).toBe("RANGE")
        expect(prop.key.uuid).toBeFalsy()
        expect(prop.transient).toBeFalsy()
        expect(prop.typeInfo).toBeDefined()
        expect(prop.typeInfo.isCustom).toBeTruthy()
        expect(prop.typeInfo.type).toBe(Moment)
      })

      it("lastUpdated", () => {
        let prop = getProperty(modelOptions, "lastUpdated")
        expect(prop).toBeDefined()
        expect(prop.name).toBe("lastUpdated")
        expect(prop.nameDb).toBe("lastUpdated")
        expect(prop.key).toBeUndefined()
        expect(prop.transient).toBeFalsy()
        expect(prop.typeInfo).toBeDefined()
        expect(prop.typeInfo.isCustom).toBeTruthy()
        expect(prop.typeInfo.type).toBe(Moment)
      })

      it("active", () => {
        let prop = getProperty(modelOptions, "active")
        expect(prop).toBeDefined()
        expect(prop.name).toBe("active")
        expect(prop.nameDb).toBe("isActive")
        expect(prop.key).toBeUndefined()
        expect(prop.transient).toBeFalsy()
        expect(prop.typeInfo).toBeDefined()
        expect(prop.typeInfo.isCustom).toBeFalsy()
        expect(prop.typeInfo.type).toBe(Boolean)
      })

      it("set", () => {
        let prop = getProperty(modelOptions, "set")
        expect(prop).toBeDefined()
        expect(prop.name).toBe("set")
        expect(prop.nameDb).toBe("set")
        expect(prop.key).toBeUndefined()
        expect(prop.transient).toBeFalsy()
        expect(prop.typeInfo).toBeDefined()
        expect(prop.typeInfo.isCustom).toBeTruthy()
        expect(prop.typeInfo.type).toBe(Set)
      })

      // TODO decide if we support map or not
      // xit("myMap", () => {
      //   let prop = getProperty(modelOptions, "myMap")
      //   expect(prop).toBeDefined()
      //   expect(prop.key).toBe("myMap")
      //   expect(prop.name).toBe("myMap")
      //   expect(prop.partitionKey).toBeFalsy()
      //   expect(prop.sortKey).toBeFalsy()
      //   expect(prop.transient).toBeFalsy()
      //   expect(prop.typeInfo).toBeDefined()
      //   expect(prop.typeInfo.isCustom).toBeTruthy()
      //   expect(prop.typeInfo.type).toBe(Map)
      //   expect(prop.typeInfo.typeName).toBe("Map")
      // })

      it("sortedSet", () => {
        let prop = getProperty(modelOptions, "sortedSet")
        expect(prop).toBeDefined()
        expect(prop.name).toBe("sortedSet")
        expect(prop.nameDb).toBe("sortedSet")
        expect(prop.key).toBeUndefined()
        expect(prop.transient).toBeFalsy()
        expect(prop.isSortedCollection).toBeTruthy()
        expect(prop.typeInfo).toBeDefined()
        expect(prop.typeInfo.isCustom).toBeTruthy()
        expect(prop.typeInfo.type).toBe(Set)
      })

      it("sortedComplexSet", () => {
        let prop = getProperty(modelOptions, "sortedComplexSet")
        expect(prop).toBeDefined()
        expect(prop.name).toBe("sortedComplexSet")
        expect(prop.nameDb).toBe("sortedComplexSet")
        expect(prop.key).toBeUndefined()
        expect(prop.transient).toBeFalsy()
        expect(prop.isSortedCollection).toBeTruthy()

        expect(prop.typeInfo).toBeDefined()
        expect(prop.typeInfo.isCustom).toBeTruthy()
        expect(prop.typeInfo.type).toBe(Set)

        expect(prop.typeInfo.genericTypes).toBeDefined()
        expect(prop.typeInfo.genericTypes.length).toBe(1)
        expect(prop.typeInfo.genericTypes[0]).toBe(NestedObject)
      })

      it("mapWithNoType", () => {
        let prop = getProperty(modelOptions, "mapWithNoType")
        expect(prop).toBeDefined()
        expect(prop.name).toBe("mapWithNoType")
        expect(prop.nameDb).toBe("mapWithNoType")
        expect(prop.key).toBeUndefined()
        expect(prop.transient).toBeFalsy()
        expect(prop.typeInfo).toBeDefined()
        expect(prop.typeInfo.isCustom).toBeTruthy()
        expect(prop.typeInfo.type).toBe(Object)
      })

      it("transientField", () => {
        let prop = getProperty(modelOptions, "transientField")
        expect(prop).toBeDefined()
        expect(prop.name).toBe("transientField")
        expect(prop.nameDb).toBe("transientField")
        expect(prop.key).toBeUndefined()
        expect(prop.transient).toBeTruthy()
        expect(prop.typeInfo).toBeDefined()
        expect(prop.typeInfo.isCustom).toBeFalsy()
        expect(prop.typeInfo.type).toBe(String)
      })

      it("simpleProperty", () => {
        let prop = getProperty(modelOptions, "simpleProperty")
        expect(prop).toBeUndefined()
      })

      it("nestedObject", () => {
        let prop = getProperty(modelOptions, "nestedObj")
        expect(prop).toBeDefined()
        expect(prop.name).toBe("nestedObj")
        expect(prop.nameDb).toBe("nestedObj")
        expect(prop.key).toBeUndefined()
        expect(prop.transient).toBeFalsy()
        expect(prop.typeInfo).toBeDefined()
        expect(prop.typeInfo.isCustom).toBeTruthy()
        expect(prop.typeInfo.type).toBe(NestedObject)
      })
    })
  })
})

function getProperty<T, K extends keyof T>(
  modelOptions: ModelMetadata<T>,
  propertyKey: K
): PropertyMetadata<T[K]> | undefined {
  return modelOptions.properties.find(property => property.name === propertyKey)
}
