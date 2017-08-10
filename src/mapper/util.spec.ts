import { Util } from "./util"

describe("Util", () => {
  describe("is set", () => {
    it("Set instance", () => {
      const set: Set<string> = new Set(["foo", "bar"])
      expect(Util.isSet(set)).toBeTruthy()
    })

    it("array (using literal)", () => {
      const arr: string[] = ["foo", "bar"]
      expect(Util.isSet(arr)).toBeFalsy()
    })

    it("array (using constructor)", () => {
      const arr: string[] = new Array()
      arr.push("foo", "bar")
      expect(Util.isSet(arr)).toBeFalsy()
    })
  })

  describe("is collection", () => {
    it("set is collection", () => {
      const set: Set<string> = new Set(["foo", "bar"])
      expect(Util.isCollection(set)).toBeTruthy()
    })

    it("array (using literal) is collection", () => {
      const arr: string[] = ["foo", "bar"]
      expect(Util.isCollection(arr)).toBeTruthy()
    })

    it("array (using constructor) is collection", () => {
      const arr: string[] = new Array()
      arr.push("foo", "bar")
      expect(Util.isCollection(arr)).toBeTruthy()
    })

    it("all falsey", () => {
      expect(Util.isCollection("bla")).toBeFalsy()
      expect(Util.isCollection(5)).toBeFalsy()
      expect(Util.isCollection(null)).toBeFalsy()
      expect(Util.isCollection(true)).toBeFalsy()
      expect(Util.isCollection({ foo: "foo", bar: 5 })).toBeFalsy()
    })
  })

  describe("detect collection type", () => {
    it("set with string values", () => {
      const collection: Set<string> = new Set(["foo", "bar"])
      expect(Util.detectCollectionType(collection)).toBe("SS")
    })

    it("set with number values", () => {
      const collection: Set<string> = new Set([25, 65])
      expect(Util.detectCollectionType(collection)).toBe("NS")
    })

    // TODO implement binary
    // it('set with binary values', ()=>{
    //   const collection: Set<string> = new Set(['foo', 'bar']);
    //   expect(Util.detectCollectionType(collection)).toBe('BS');
    // })

    it("set with object values", () => {
      const collection: Set<string> = new Set([{ foo: "foo" }, { bar: "bar" }])
      expect(Util.detectCollectionType(collection)).toBe("L")
    })
  })
})
