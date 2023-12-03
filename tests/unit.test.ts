import {
  randomNumbers,
  randomNumbersBlueprint,
  randomObjects,
  randomFromArray,
  randomFromArrayBlueprint,
  randomIDs,
  randomIDsBlueprint,
  gradualValue,
  gradualValueBlueprint,
  randomCustomFunction,
  randomCustomFunctionBlueprint,
  randomStrings,
  randomStringsBlueprint,
  randomArray,
  randomArrayBlueprint,
} from "../randomObjects";

describe("random objects", () => {
  test("length static working", () => {
    expect(
      randomObjects({ key1: 5 }, 15).filter((e) => e.key1 === 5)
    ).toHaveLength(15);
  });
});

describe("random numbers", () => {
  describe("normal", () => {
    const options = {
      starting: 5,
      ending: 25,
      numberOfItems: 15,
      unique: true,
      showLogs: false,
      reCreateLimit: 10,
      onlyIntegers: false,
      maximumDigitsAfterPoint: 5,
    };

    const result = randomNumbers(options);

    test("populated options - length", () => {
      expect(result).toHaveLength(15);
    });

    test("populated options - has only numbers", () => {
      expect(result.filter((item) => typeof item === "number")).toHaveLength(
        15
      );
    });

    test("no options - length", () => {
      expect(randomNumbers()).toHaveLength(100);
    });

    test("custom map", () => {
      expect(
        randomNumbers({
          ...options,
          customMap: (item) => "+" + item,
        }).filter((e) => (e as string).startsWith("+"))
      ).toHaveLength(15);
    });

    test("recreate limit", () => {
      expect(
        randomNumbers({
          ...options,
          customMap: () => "55",
        })
      );
    });

    test("populated options - items are between min and max", () => {
      expect(
        result.filter(
          (item) =>
            (item as number) <= options.ending &&
            (item as number) >= options.starting
        )
      ).toHaveLength(15);
    });
  });

  describe("blueprint", () => {
    const options = {
      starting: 5,
      ending: 25,
      unique: true,
      showLogs: false,
      reCreateLimit: 10,
      onlyIntegers: false,
      maximumDigitsAfterPoint: 5,
    };

    const result = randomNumbersBlueprint(options);

    test("result is function data object", () => {
      expect(Object.keys(result)).toEqual(["functionOptions", "functionCall"]);
    });

    test("function call is callable", () => {
      expect(
        result.functionCall({
          ...result.functionOptions,
          numberOfItems: 15,
        })
      ).toHaveLength(15);
    });
  });

  describe("random objects", () => {
    const options = {
      starting: 5,
      ending: 25,
      unique: true,
      showLogs: false,
      reCreateLimit: 10,
      onlyIntegers: false,
      maximumDigitsAfterPoint: 5,
    };

    const blueprint = {
      key1: randomNumbersBlueprint(options),
    };

    test("length", () => {
      expect(randomObjects(blueprint, 15)).toHaveLength(15);
    });

    test("has only numbers", () => {
      expect(
        randomObjects(blueprint, 15).filter((e) => typeof e.key1 === "number")
      ).toHaveLength(15);
    });
  });
});

describe("random from array", () => {
  describe("normal", () => {
    const arrayOfItems: unknown[] = [1, 2, 3, 4, [1, 56, 9], 6, { te: 56 }];

    const options = {
      arrayOfItems,
      numberOfItems: 15,
      unique: true,
      showLogs: false,
      reCreateLimit: 10,
      keepOrder: false,
    };

    const result = randomFromArray(options);

    test("populated options - length", () => {
      expect(result).toHaveLength(15);
    });

    test("populated options - has only items from given array", () => {
      expect(result.filter((item) => arrayOfItems.includes(item))).toHaveLength(
        15
      );
    });

    test("no options - length", () => {
      expect(randomFromArray({ arrayOfItems: [0] })).toHaveLength(100);
    });

    test("keep order", () => {
      expect(
        randomFromArray({
          arrayOfItems,
          keepOrder: true,
          numberOfItems: 4,
        })
      ).toEqual(arrayOfItems.slice(0, 4));
    });

    test("custom map", () => {
      expect(
        randomFromArray({
          arrayOfItems,
          numberOfItems: 15,
          customMap: (item) => "+" + JSON.stringify(item),
        }).filter((e) => (e as string).startsWith("+"))
      ).toHaveLength(15);
    });

    test("recreate limit", () => {
      expect(
        randomNumbers({
          ...options,
          customMap: () => "55",
        })
      );
    });
  });

  describe("blueprint", () => {
    const arrayOfItems: unknown[] = [1, 2, 3, 4, [1, 56, 9], 6, { te: 56 }];

    const options = {
      arrayOfItems,
      unique: true,
      showLogs: false,
      reCreateLimit: 10,
      keepOrder: false,
    };

    const result = randomFromArrayBlueprint(options);

    test("result is function data object", () => {
      expect(Object.keys(result)).toEqual(["functionOptions", "functionCall"]);
    });

    test("function call is callable", () => {
      expect(
        result.functionCall({
          ...result.functionOptions,
          numberOfItems: 15,
        })
      ).toHaveLength(15);
    });
  });

  describe("random objects", () => {
    const arrayOfItems: unknown[] = [1, 2, 3, 4, [1, 56, 9], 6, { te: 56 }];

    const options = {
      arrayOfItems,
      unique: true,
      showLogs: false,
      reCreateLimit: 10,
      keepOrder: false,
    };

    const blueprint = {
      key1: randomFromArrayBlueprint(options),
    };

    test("length", () => {
      expect(randomObjects(blueprint, 15)).toHaveLength(15);
    });

    test("has only items from given array", () => {
      expect(
        randomObjects(blueprint, 15).filter((e) =>
          arrayOfItems.includes(e.key1)
        )
      ).toHaveLength(15);
    });
  });
});

describe("random ids", () => {
  type charLibs = "number" | "letter" | "symbol";

  describe("normal", () => {
    const options = {
      minIDLength: 5,
      maxIDLength: 20,
      charLib: ["letter", "number", "symbol"] as charLibs[],
      numberOfItems: 15,
      unique: true,
      showLogs: false,
      reCreateLimit: 10,
    };

    const result = randomIDs(options);

    test("populated options - length", () => {
      expect(result).toHaveLength(15);
    });

    test("populated options - has only string", () => {
      expect(result.filter((item) => typeof item === "string")).toHaveLength(
        15
      );
    });

    test("no options - length", () => {
      expect(randomIDs()).toHaveLength(100);
    });

    test("custom map", () => {
      expect(
        randomIDs({
          ...options,
          customMap: (item) => "+" + item,
        }).filter((e) => (e as string).startsWith("+"))
      ).toHaveLength(15);
    });

    test("recreate limit", () => {
      expect(
        randomIDs({
          ...options,
          customMap: () => "55",
        })
      );
    });

    test("populated options - items are between min and max", () => {
      expect(
        result.filter(
          (item) =>
            (item as string).length <= options.maxIDLength &&
            (item as string).length >= options.minIDLength
        )
      ).toHaveLength(15);
    });

    test("populated options - charLibs is working", () => {
      expect(
        randomIDs({
          ...options,
          charLib: ["number"],
        }).filter((item) =>
          (item as string)
            .split("")
            .map((e) => parseInt(e))
            .every((e) => typeof e === "number")
        )
      ).toHaveLength(15);
    });
  });

  describe("blueprint", () => {
    const options = {
      minIDLength: 5,
      maxIDLength: 20,
      charLib: ["letter", "number", "symbol"] as charLibs[],
      unique: true,
      showLogs: false,
      reCreateLimit: 10,
    };

    const result = randomIDsBlueprint(options);

    test("result is function data object", () => {
      expect(Object.keys(result)).toEqual(["functionOptions", "functionCall"]);
    });

    test("function call is callable", () => {
      expect(
        result.functionCall({
          ...result.functionOptions,
          numberOfItems: 15,
        })
      ).toHaveLength(15);
    });
  });

  describe("random objects", () => {
    const options = {
      minIDLength: 5,
      maxIDLength: 20,
      charLib: ["letter", "number", "symbol"] as charLibs[],
      unique: true,
      showLogs: false,
      reCreateLimit: 10,
    };

    const blueprint = {
      key1: randomIDsBlueprint(options),
    };

    test("length", () => {
      expect(randomObjects(blueprint, 15)).toHaveLength(15);
    });

    test("has only strings", () => {
      expect(
        randomObjects(blueprint, 15).filter((e) => typeof e.key1 === "string")
      ).toHaveLength(15);
    });
  });
});

describe("gradual value", () => {
  describe("normal", () => {
    const options = {
      starting: 5,
      incrementValue: 2,
      numberOfItems: 15,
      unique: true,
      showLogs: false,
      reCreateLimit: 10,
    };

    const result = gradualValue(options);

    test("populated options - length", () => {
      expect(result).toHaveLength(15);
    });

    test("populated options - has only numbers", () => {
      expect(result.filter((item) => typeof item === "number")).toHaveLength(
        15
      );
    });

    test("no options - length", () => {
      expect(gradualValue()).toHaveLength(100);
    });

    test("custom map", () => {
      expect(
        gradualValue({
          ...options,
          customMap: (item) => "+" + item,
        }).filter((e) => (e as string).startsWith("+"))
      ).toHaveLength(15);
    });

    test("recreate limit", () => {
      expect(
        gradualValue({
          ...options,
          customMap: () => "55",
        })
      );
    });

    test("increment value and starting are working", () => {
      expect(
        gradualValue({
          ...options,
          numberOfItems: 3,
        })
      ).toEqual([5, 7, 9]);
    });
  });

  describe("blueprint", () => {
    const options = {
      starting: 5,
      incrementValue: 2,
      numberOfItems: 15,
      unique: true,
      showLogs: false,
      reCreateLimit: 10,
    };

    const result = gradualValueBlueprint(options);

    test("result is function data object", () => {
      expect(Object.keys(result)).toEqual(["functionOptions", "functionCall"]);
    });

    test("function call is callable", () => {
      expect(
        result.functionCall({
          ...result.functionOptions,
          numberOfItems: 15,
        })
      ).toHaveLength(15);
    });
  });

  describe("random objects", () => {
    const options = {
      starting: 5,
      incrementValue: 2,
      unique: true,
      showLogs: false,
      reCreateLimit: 10,
    };

    const blueprint = {
      key1: gradualValueBlueprint(options),
    };

    test("length", () => {
      expect(randomObjects(blueprint, 15)).toHaveLength(15);
    });

    test("has only numbers", () => {
      expect(
        randomObjects(blueprint, 15).filter((e) => typeof e.key1 === "number")
      ).toHaveLength(15);
    });
  });
});

describe("random custom function", () => {
  describe("normal", () => {
    const options = {
      customFunction: ((index) => index * 5) as (index: number) => unknown,
      numberOfItems: 15,
      unique: true,
      showLogs: false,
      reCreateLimit: 10,
    };

    const result = randomCustomFunction(options);

    test("populated options - length", () => {
      expect(result).toHaveLength(15);
    });

    test("populated options - has only custom function output", () => {
      expect(result.filter((item) => typeof item === "number")).toHaveLength(
        15
      );
    });

    test("custom map", () => {
      expect(
        randomCustomFunction({
          ...options,
          customMap: (item) => "+" + item,
        }).filter((e) => (e as string).startsWith("+"))
      ).toHaveLength(15);
    });

    test("recreate limit", () => {
      expect(
        randomCustomFunction({
          ...options,
          customMap: () => "55",
        })
      );
    });

    test("populated options - custom function working", () => {
      expect(
        randomCustomFunction({
          ...options,
          customFunction: (index) => index * 5,
          numberOfItems: 5,
        })
      ).toEqual([0, 5, 10, 15, 20]);
    });
  });

  describe("blueprint", () => {
    const options = {
      customFunction: ((index) => index * 5) as (index: number) => unknown,
      unique: true,
      showLogs: false,
      reCreateLimit: 10,
    };

    const result = randomCustomFunctionBlueprint(options);

    test("result is function data object", () => {
      expect(Object.keys(result)).toEqual(["functionOptions", "functionCall"]);
    });

    test("function call is callable", () => {
      expect(
        result.functionCall({
          ...result.functionOptions,
          numberOfItems: 15,
        })
      ).toHaveLength(15);
    });
  });

  describe("random objects", () => {
    const options = {
      customFunction: ((index) => index * 5) as (index: number) => unknown,
      unique: true,
      showLogs: false,
      reCreateLimit: 10,
    };

    const blueprint = {
      key1: randomCustomFunctionBlueprint(options),
    };

    test("length", () => {
      expect(randomObjects(blueprint, 15)).toHaveLength(15);
    });

    test("has only numbers", () => {
      expect(
        randomObjects(blueprint, 15).filter((e) => typeof e.key1 === "number")
      ).toHaveLength(15);
    });
  });
});

describe("random strings", () => {
  type wordLibs = "name" | "adjective" | "country" | "noun";

  describe("normal", () => {
    const options = {
      minNumberOfWords: 1,
      maxNumberOfWords: 4,
      lib: ["adjective", "name"] as wordLibs[],
      separator: " ",
      numberOfItems: 15,
      unique: true,
      showLogs: false,
      reCreateLimit: 10,
    };

    const result = randomStrings(options);

    test("populated options - length", () => {
      expect(result).toHaveLength(15);
    });

    test("populated options - has only strings", () => {
      expect(result.filter((item) => typeof item === "string")).toHaveLength(
        15
      );
    });

    test("no options - length", () => {
      expect(randomStrings()).toHaveLength(100);
    });

    test("custom map", () => {
      expect(
        randomStrings({
          ...options,
          customMap: (item) => "+" + item,
        }).filter((e) => (e as string).startsWith("+"))
      ).toHaveLength(15);
    });

    test("recreate limit", () => {
      expect(
        randomStrings({
          ...options,
          customMap: () => "55",
        })
      );
    });

    test("populated options - items are between min and max", () => {
      expect(
        result.filter(
          (item) =>
            (item as string).split(" ").length <= options.maxNumberOfWords &&
            (item as string).split(" ").length >= options.minNumberOfWords
        )
      ).toHaveLength(15);
    });
  });

  describe("blueprint", () => {
    const options = {
      minNumberOfWords: 1,
      maxNumberOfWords: 4,
      lib: ["adjective", "country"] as wordLibs[],
      separator: " ",
      numberOfItems: 15,
      unique: true,
      showLogs: false,
      reCreateLimit: 10,
    };

    const result = randomStringsBlueprint(options);

    test("result is function data object", () => {
      expect(Object.keys(result)).toEqual(["functionOptions", "functionCall"]);
    });

    test("function call is callable", () => {
      expect(
        result.functionCall({
          ...result.functionOptions,
          numberOfItems: 15,
        })
      ).toHaveLength(15);
    });
  });

  describe("random objects", () => {
    const options = {
      minNumberOfWords: 1,
      maxNumberOfWords: 4,
      lib: ["adjective", "country"] as wordLibs[],
      separator: " ",
      numberOfItems: 15,
      unique: true,
      showLogs: false,
      reCreateLimit: 10,
    };

    const blueprint = {
      key1: randomStringsBlueprint(options),
    };

    test("length", () => {
      expect(randomObjects(blueprint, 15)).toHaveLength(15);
    });

    test("has only string", () => {
      expect(
        randomObjects(blueprint, 15).filter((e) => typeof e.key1 === "string")
      ).toHaveLength(15);
    });
  });
});

describe("random array", () => {
  describe("normal", () => {
    const arrayOfItems = [1, 2, 3, 4, 5, 6, 7];

    const options = {
      arrayOfItems,
      allowDuplicates: false,
      keepOrder: false,
      minLengthOfArray: 1,
      maxLengthOfArray: 5,
      numberOfItems: 15,
      unique: true,
      showLogs: false,
      reCreateLimit: 10,
    };

    const result = randomArray(options);

    test("populated options - length", () => {
      expect(result).toHaveLength(15);
    });

    test("populated options - has only arrays", () => {
      expect(result.filter((item) => Array.isArray(item))).toHaveLength(15);
    });

    test("no options - length", () => {
      expect(randomArray({ arrayOfItems })).toHaveLength(100);
    });

    test("custom map", () => {
      expect(
        randomArray({
          ...options,
          customMap: (item) => (item as []).length,
        }).filter((e) => typeof e === "number")
      ).toHaveLength(15);
    });

    test("recreate limit", () => {
      expect(
        randomArray({
          ...options,
          customMap: () => "55",
        })
      );
    });
  });

  describe("blueprint", () => {
    const arrayOfItems = [1, 2, 3, 4, 5, 6, 7];

    const options = {
      arrayOfItems,
      allowDuplicates: false,
      keepOrder: false,
      minLengthOfArray: 1,
      maxLengthOfArray: 5,
      numberOfItems: 15,
      unique: true,
      showLogs: false,
      reCreateLimit: 10,
    };

    const result = randomArrayBlueprint(options);

    test("result is function data object", () => {
      expect(Object.keys(result)).toEqual(["functionOptions", "functionCall"]);
    });

    test("function call is callable", () => {
      expect(
        result.functionCall({
          ...result.functionOptions,
          numberOfItems: 15,
        })
      ).toHaveLength(15);
    });
  });

  describe("random objects", () => {
    const arrayOfItems = [1, 2, 3, 4, 5, 6, 7];

    const options = {
      arrayOfItems,
      allowDuplicates: false,
      keepOrder: false,
      minLengthOfArray: 1,
      maxLengthOfArray: 5,
      numberOfItems: 15,
      unique: true,
      showLogs: false,
      reCreateLimit: 10,
    };

    const blueprint = {
      key1: randomArrayBlueprint(options),
    };

    test("length", () => {
      expect(randomObjects(blueprint, 15)).toHaveLength(15);
    });

    test("has only numbers", () => {
      expect(
        randomObjects(blueprint, 15).filter((e) => Array.isArray(e.key1))
      ).toHaveLength(15);
    });
  });
});

// describe("random numbers", () => {
//   describe("normal", () => {
//     const options = {
//       starting: 5,
//       ending: 25,
//       numberOfItems: 15,
//       unique: true,
//       showLogs: false,
//       reCreateLimit: 10,
//       onlyIntegers: false,
//       maximumDigitsAfterPoint: 5,
//     };

//     const result = randomNumbers(options);

//     test("populated options - length", () => {
//       expect(result).toHaveLength(15);
//     });

//     test("populated options - has only numbers", () => {
//       expect(result.filter((item) => typeof item === "number")).toHaveLength(
//         15
//       );
//     });

//     test("no options - length", () => {
//       expect(randomNumbers()).toHaveLength(100);
//     });

//     test("custom map", () => {
//       expect(
//         randomNumbers({
//           ...options,
//           customMap: (item) => "+" + item,
//         }).filter((e) => (e as string).startsWith("+"))
//       ).toHaveLength(15);
//     });

//     test("recreate limit", () => {
//       expect(
//         randomNumbers({
//           ...options,
//           customMap: () => "55",
//         })
//       );
//     });
//   });

//   describe("blueprint", () => {
//     const options = {
//       starting: 5,
//       ending: 25,
//       unique: true,
//       showLogs: false,
//       reCreateLimit: 10,
//       onlyIntegers: false,
//       maximumDigitsAfterPoint: 5,
//     };

//     const result = randomNumbersBlueprint(options);

//     test("result is function data object", () => {
//       expect(Object.keys(result)).toEqual(["functionOptions", "functionCall"]);
//     });

//     test("function call is callable", () => {
//       expect(
//         result.functionCall({
//           ...result.functionOptions,
//           numberOfItems: 15,
//         })
//       ).toHaveLength(15);
//     });
//   });

//   describe("random objects", () => {
//     const options = {
//       starting: 5,
//       ending: 25,
//       unique: true,
//       showLogs: false,
//       reCreateLimit: 10,
//       onlyIntegers: false,
//       maximumDigitsAfterPoint: 5,
//     };

//     const blueprint = {
//       key1: randomNumbersBlueprint(options),
//     };

//     test("length", () => {
//       expect(randomObjects(blueprint, 15)).toHaveLength(15);
//     });

//     test("has only numbers", () => {
//       expect(
//         randomObjects(blueprint, 15).filter((e) => typeof e.key1 === "number")
//       ).toHaveLength(15);
//     });
//   });
// });
