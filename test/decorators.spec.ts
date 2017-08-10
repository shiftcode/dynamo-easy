import { Metadata, MetadataHelper } from "../src/decorators/metadata"
import { Model } from "../src/decorators/model.decorator"
import { PartitionKey } from "../src/decorators/partition-key.decorator"
import { Property } from "../src/decorators/property.decorator"
import { Transient } from "../src/decorators/transient.decorator"
import { Type } from "../src/decorators/type.decorator"
import { ModelMetadata } from "../src/decorators/model-metadata.model"
import { PropertyMetadata } from "../src/decorators/property-metadata.model"
import { SortKey } from "../src/decorators/sort-key.decorator"
import { ScDynamoObjectMapper } from "../src/sc-dynamo-object-mapper"
import { ModelWithDate } from "./models/model-with-date.model"
import { ModelWithDateMoment } from "./models/model-with-date-moment.model"
import { ComplexModel, NestedObject } from "./models/complex.model"
import { SimpleModel } from "./models/simple.model"
import { CustomTableNameModel } from "./models/custom-table-name.model"
import moment from "moment"
import { AttributeModelTypeName } from "../src/mapper/attribute-model-type.type"

describe("Decorators should add correct metadata", () => {
  describe("for simple model", () => {
    let modelOptions: ModelMetadata

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
    let modelOptions: ModelMetadata

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
    let modelOptions: ModelMetadata

    beforeEach(() => {
      modelOptions = MetadataHelper.get(ModelWithDateMoment).modelOptions
    })

    it("id", () => {
      let prop: PropertyMetadata = getProperty(modelOptions, "id")
      expect(prop).toBeDefined()
      expect(prop.key).toBe("id")
      expect(prop.name).toBe("id")
      expect(prop.partitionKey).toBeTruthy()
      expect(prop.sortKey).toBeFalsy()
      expect(prop.customType).toBeFalsy()
      expect(prop.transient).toBeFalsy()
      expect(prop.type).toBe(String)
    })

    it("creationDate", () => {
      let prop: PropertyMetadata = getProperty(modelOptions, "creationDate")
      expect(prop).toBeDefined()
      expect(prop.key).toBe("creationDate")
      expect(prop.name).toBe("creationDate")
      expect(prop.partitionKey).toBeFalsy()
      expect(prop.sortKey).toBeTruthy()
      expect(prop.customType).toBeTruthy()
      expect(prop.transient).toBeFalsy()
      expect(prop.type).toBe("moment")
    })

    it("lastUpdated", () => {
      let prop: PropertyMetadata = getProperty(modelOptions, "lastUpdated")
      expect(prop).toBeDefined()
      expect(prop.key).toBe("lastUpdated")
      expect(prop.name).toBe("lastUpdated")
      expect(prop.partitionKey).toBeFalsy()
      expect(prop.sortKey).toBeFalsy()
      expect(prop.customType).toBeTruthy()
      expect(prop.transient).toBeFalsy()
      expect(prop.type).toBe("moment")
    })
  })

  describe("for complex model", () => {
    let modelOptions: ModelMetadata

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
      expect(modelOptions.properties.length).toBe(9)
    })

    it("with correct transient properties", () => {
      expect(modelOptions.transientProperties).toBeDefined()
      expect(modelOptions.transientProperties.length).toBe(1)
    })

    describe("with correct property metdata", () => {
      it("ids", () => {
        let prop: PropertyMetadata = getProperty(modelOptions, "ids")
        expect(prop).toBeDefined()
        expect(prop.key).toBe("ids")
        expect(prop.name).toBe("ids")
        expect(prop.partitionKey).toBeTruthy()
        expect(prop.sortKey).toBeFalsy()
        expect(prop.customType).toBeFalsy()
        expect(prop.transient).toBeFalsy()
        expect(prop.type).toBe(String)
        expect(prop.typeName).toBe("String")
      })

      it("creationDate", () => {
        let prop: PropertyMetadata = getProperty(modelOptions, "creationDate")
        expect(prop).toBeDefined()
        expect(prop.key).toBe("creationDate")
        expect(prop.name).toBe("creationDate")
        expect(prop.partitionKey).toBeFalsy()
        expect(prop.sortKey).toBeTruthy()
        expect(prop.customType).toBeTruthy()
        expect(prop.transient).toBeFalsy()
        expect(prop.type).toBe("moment")
        expect(prop.typeName).toBe("Moment")
      })

      it("lastUpdated", () => {
        let prop: PropertyMetadata = getProperty(modelOptions, "lastUpdated")
        expect(prop).toBeDefined()
        expect(prop.key).toBe("lastUpdated")
        expect(prop.name).toBe("lastUpdated")
        expect(prop.partitionKey).toBeFalsy()
        expect(prop.sortKey).toBeFalsy()
        expect(prop.customType).toBeTruthy()
        expect(prop.transient).toBeFalsy()
        expect(prop.type).toBe("moment")
        expect(prop.typeName).toBe("Moment")
      })

      it("active", () => {
        let prop: PropertyMetadata = getProperty(modelOptions, "active")
        expect(prop).toBeDefined()
        expect(prop.key).toBe("active")
        expect(prop.name).toBe("isActive")
        expect(prop.partitionKey).toBeFalsy()
        expect(prop.sortKey).toBeFalsy()
        expect(prop.customType).toBeFalsy()
        expect(prop.transient).toBeFalsy()
        expect(prop.type).toBe(Boolean)
        expect(prop.typeName).toBe("Boolean")
      })

      it("set", () => {
        let prop: PropertyMetadata = getProperty(modelOptions, "set")
        expect(prop).toBeDefined()
        expect(prop.key).toBe("set")
        expect(prop.name).toBe("set")
        expect(prop.partitionKey).toBeFalsy()
        expect(prop.sortKey).toBeFalsy()
        expect(prop.customType).toBeTruthy()
        expect(prop.transient).toBeFalsy()
        expect(prop.type).toBe(Set)
        expect(prop.typeName).toBe("Set")
      })

      it("myMap", () => {
        let prop: PropertyMetadata = getProperty(modelOptions, "myMap")
        expect(prop).toBeDefined()
        expect(prop.key).toBe("myMap")
        expect(prop.name).toBe("myMap")
        expect(prop.partitionKey).toBeFalsy()
        expect(prop.sortKey).toBeFalsy()
        expect(prop.customType).toBeTruthy()
        expect(prop.transient).toBeFalsy()
        expect(prop.type).toBe(Map)
        expect(prop.typeName).toBe("Map")
      })

      it("mapWithNoType", () => {
        let prop: PropertyMetadata = getProperty(modelOptions, "mapWithNoType")
        expect(prop).toBeDefined()
        expect(prop.key).toBe("mapWithNoType")
        expect(prop.name).toBe("mapWithNoType")
        expect(prop.partitionKey).toBeFalsy()
        expect(prop.sortKey).toBeFalsy()
        expect(prop.customType).toBeTruthy()
        expect(prop.transient).toBeFalsy()
        expect(prop.type).toBe(Object)
        expect(prop.typeName).toBe("Object")
      })

      it("transientField", () => {
        let prop: PropertyMetadata = getProperty(modelOptions, "transientField")
        expect(prop).toBeDefined()
        expect(prop.key).toBe("transientField")
        expect(prop.name).toBe("transientField")
        expect(prop.partitionKey).toBeFalsy()
        expect(prop.sortKey).toBeFalsy()
        expect(prop.customType).toBeFalsy()
        expect(prop.transient).toBeTruthy()
        expect(prop.type).toBe(String)
        expect(prop.typeName).toBe("String")
      })

      it("simpleProperty", () => {
        let prop: PropertyMetadata = getProperty(modelOptions, "simpleProperty")
        expect(prop).toBeUndefined()
      })

      it("nestedObject", () => {
        let prop: PropertyMetadata = getProperty(modelOptions, "nestedObj")
        expect(prop).toBeDefined()
        expect(prop.key).toBe("nestedObj")
        expect(prop.name).toBe("nestedObj")
        expect(prop.partitionKey).toBeFalsy()
        expect(prop.sortKey).toBeFalsy()
        expect(prop.customType).toBeTruthy()
        expect(prop.transient).toBeFalsy()
        expect(prop.type).toBe(NestedObject)
        expect(prop.typeName).toBe("NestedObject")
      })
    })
  })
})

function getProperty(
  modelOptions: ModelMetadata,
  propertyKey: string
): PropertyMetadata | undefined {
  return modelOptions.properties.find(property => property.key === propertyKey)
}
