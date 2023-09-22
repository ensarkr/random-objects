import { listOfNames } from "./sources/listOfNames.js";
import { listOfAdjectives } from "./sources/listOfAdjectives.js";
import { listOfCountries } from "./sources/listOfCountries.js";
import { listOfNouns } from "./sources/listOfNouns.js";

interface generateFunctionReturn {
  items: unknown[] | null;
  functionData: functionData;
}

interface functionData {
  arguments: functionArguments;
  functionCall: generateFromArgObjectType;
}

interface functionArguments {
  inputs?: allMainInputTypes;
  options?: baseFunctionOptions & allMainOptionTypes;
}

interface baseFunctionOptions {
  numberOfItems?: number;
  unique?: boolean;
  customMap?(item: unknown, index: number): unknown;
  customCompare?(item: unknown, items: unknown[], index: number): boolean;
  progressUpdate?: {
    uniqueCheckFailed?: (functionName: string, limit?: number | null) => void;
    afterItemCreated?: (
      item: unknown,
      index: number,
      functionName: string
    ) => void;
    afterMap?: (item: unknown, index: number, functionName: string) => void;
    afterCompare?: (
      item: unknown,
      index: number,
      functionName: string,
      compareResult: boolean
    ) => void;
    afterUnique?: (
      item: unknown,
      index: number,
      functionName: string,
      uniqueResult: boolean
    ) => void;
  };
  showLogs?: boolean;
  reCreateLimit?: number | null;
}

type allMainInputTypes =
  | gradualValueInputs
  | randomNumbersInputs
  | randomsFromArrayInputs
  | randomIDsInputs
  | randomCustomFunctionInputs
  | randomStringsInputs;

type allMainOptionTypes =
  | gradualValueOptions
  | randomNumbersOptions
  | randomsFromArrayOptions
  | randomIDsOptions
  | randomCustomFunctionOptions
  | randomStringsOptions;

type generateItemType = (
  inputs: allMainInputTypes,
  options: allMainOptionTypes,
  index: number,
  sameProperties?: object
) => { item: unknown; sameProperties?: object };

type uniqueErrorCheckType = (
  inputs: allMainInputTypes,
  options: allMainOptionTypes
) => boolean | undefined;

type generateArrayType = (
  inputs: allMainInputTypes,
  options: allMainOptionTypes
) => generateFunctionReturn;

type generateFromArgObjectType = ({
  inputs,
  options,
}: {
  inputs: allMainInputTypes;
  options: allMainOptionTypes;
}) => unknown[] | generateFunctionReturn;

abstract class GeneratorFactory {
  constructor() {}

  protected abstract functionName: string;
  protected abstract generateItem: generateItemType;
  protected abstract uniqueErrorCheck: uniqueErrorCheckType;
  public abstract generateFromArgObject: generateFromArgObjectType;

  protected generateArray: generateArrayType = (
    inputs: allMainInputTypes,
    options: allMainOptionTypes
  ) => {
    const resultObject: generateFunctionReturn = this.returnObjectWithArguments(
      {
        inputs,
        options,
      }
    );

    let sameProperties: object;

    if (options.numberOfItems === undefined) {
      resultObject.items = null;
    } else {
      if (
        options.reCreateLimit === undefined &&
        (options.customMap ||
          options.customCompare ||
          this.functionName === "randomCustomFunction")
      ) {
        options.reCreateLimit = 1000;
      }
      options = resultObject.functionData.arguments.options;

      if (options.unique) {
        options.unique = this.uniqueErrorCheck(inputs, options);
      }

      const items: unknown[] = [];

      const indexCounter: number[] = [0, 0];

      for (let index = 0; index < options.numberOfItems; index++) {
        const { item, sameProperties: newSameProperties } = this.generateItem(
          inputs,
          options,
          index,
          sameProperties
        );
        sameProperties = newSameProperties;

        indexCounter[0] = index;
        index = this.logsAndCustomFunctions(item, index, items, options);
        if (indexCounter[0] - 1 == index) {
          indexCounter[1]++;
        } else indexCounter[1] = 0;
        if (options.reCreateLimit && indexCounter[1] >= options.reCreateLimit) {
          this.showUniqueError(options, options.reCreateLimit);
          options.unique = false;
          options.customCompare = undefined;
        }
      }

      resultObject.items = items;
    }

    return resultObject;
  };

  protected showUniqueError(options: allMainOptionTypes, limit?: number) {
    if (options.progressUpdate && options.progressUpdate.uniqueCheckFailed) {
      options.progressUpdate.uniqueCheckFailed(this.functionName, limit);
    }

    console.log(
      (typeof limit === "number"
        ? "!!! Re-create limit is reached after " +
          limit.toString() +
          " try. \n"
        : "") +
        "!!! It is impossible to create array of unique " +
        this.functionName +
        " with given arguments. \n" +
        "!!! Proceeding to create array of non-unique items" +
        (typeof limit === "number" ? " without using customCompare" : "") +
        ".\n"
    );
  }

  protected developerLog(
    proceed: boolean,
    itemNumber: number,
    value: unknown,
    description: string
  ): void {
    if (proceed) {
      console.log(this.functionName, itemNumber, value, description);
    }
  }

  protected logsAndCustomFunctions(
    item: unknown,
    index: number,
    items: unknown[],
    options: allMainOptionTypes
  ) {
    let compareResult: boolean = true;

    if (options.progressUpdate && options.progressUpdate.afterItemCreated) {
      options.progressUpdate.afterItemCreated(item, index, this.functionName);
    }
    this.developerLog(options.showLogs, index, item, "item created");

    if (options.customMap) {
      item = options.customMap(item, index) as number | string;
    }

    if (options.progressUpdate && options.progressUpdate.afterMap) {
      options.progressUpdate.afterMap(item, index, this.functionName);
    }

    this.developerLog(
      options.showLogs && options.customMap !== undefined,
      index,
      item,
      "after map function"
    );

    if (options.customCompare) {
      compareResult = options.customCompare(item, items, index) as boolean;
    }

    if (options.progressUpdate && options.progressUpdate.afterCompare) {
      options.progressUpdate.afterCompare(
        item,
        index,
        this.functionName,
        compareResult
      );
    }

    if (options.unique) {
      if (items.includes(item)) {
        compareResult = false;
      }
    }

    if (options.progressUpdate && options.progressUpdate.afterUnique) {
      options.progressUpdate.afterUnique(
        item,
        index,
        this.functionName,
        compareResult
      );
    }

    this.developerLog(
      options.showLogs &&
        (options.customCompare !== undefined || options.unique),
      index,
      item,
      "after compare function, " +
        (compareResult
          ? "no problem occurred"
          : "this item cannot be used trying again")
    );

    if (compareResult) {
      items[index] = item;
    } else {
      index--;
    }

    return index;
  }

  protected returnObjectWithArguments(
    argObject: functionArguments
  ): generateFunctionReturn {
    return {
      items: null,
      functionData: {
        arguments: argObject,
        functionCall: this.generateFromArgObject,
      },
    };
  }
}

// * Random Numbers

interface randomNumbersOptions
  extends randomNumberOptions,
    baseFunctionOptions {}

interface randomNumberOptions {
  onlyIntegers?: boolean;
  maximumDigitsAfterPoint?: number;
}

interface randomNumbersInputs {
  starting: number;
  ending: number;
}

type randomNumberType = (
  starting: number,
  ending: number,
  options?: randomNumberOptions
) => number;

type randomNumbersType = (
  starting: number,
  ending: number,
  options?: randomNumbersOptions
) => generateFunctionReturn | unknown[];

type randomNumbersArgType = ({
  inputs,
  options,
}: {
  inputs: randomNumbersInputs;
  options: randomNumbersOptions;
}) => generateFunctionReturn | unknown[];

class RandomNumbersClass extends GeneratorFactory {
  constructor() {
    super();
    this.functionName = "randomNumbers";
  }

  protected functionName: string;

  protected uniqueErrorCheck: uniqueErrorCheckType = (
    inputs: randomNumbersInputs,
    options: randomNumbersOptions
  ) => {
    const { starting, ending } = inputs;

    let maximumNumberOfItems = ending - starting;

    if (
      !options.onlyIntegers &&
      options.maximumDigitsAfterPoint !== undefined
    ) {
      maximumNumberOfItems *= Math.pow(10, options.maximumDigitsAfterPoint);
    }

    maximumNumberOfItems = maximumNumberOfItems == 0 ? 1 : maximumNumberOfItems;

    if (maximumNumberOfItems < options.numberOfItems) {
      this.showUniqueError(options);
      return false;
    }

    return options.unique;
  };

  protected generateItem: generateItemType = (
    inputs: randomNumbersInputs,
    options: randomNumbersOptions
  ) => {
    const { starting, ending } = inputs;

    let item;

    item = Math.random() * (ending - starting) + starting;

    if (options.onlyIntegers) {
      item = Math.floor(item as number);
    } else if (
      options.maximumDigitsAfterPoint !== undefined &&
      options.maximumDigitsAfterPoint !== undefined
    ) {
      const { maximumDigitsAfterPoint } = options;
      const afterPoint =
        maximumDigitsAfterPoint === 0
          ? 0
          : Math.floor(
              Math.random() * Math.pow(10, maximumDigitsAfterPoint)
            ).toString().length;

      if (item.toString().includes(".")) {
        item = Number.parseFloat(
          item.toString().split(".")[0] +
            "." +
            item.toString().split(".")[1].substring(0, afterPoint)
        );
      }
    }

    return { item };
  };

  /**
   * @param { number } starting - minimum number (included)
   * @param { number } ending - maximum number (excluded)
   * @param { object } options - properties of options object
   * - onlyIntegers?: boolean = false
   * - maximumDigitsAfterPoint?: number
   * @returns { number  } Returns number
   * @example randomNumber( 0, 10, { maximumDigitsAfterPoint: 2 })  ===>   4.3
   */
  public randomNumber: randomNumberType = (starting, ending, options = {}) => {
    return this.generateItem({ starting, ending }, options, 0).item as number;
  };

  /**
   * @param { number } starting - minimum number (included)
   * @param { number } ending - maximum number (excluded)
   * @param { object} options - properties of options object
   * - onlyIntegers?: boolean = false
   * - maximumDigitsAfterPoint?: number
   * - unique?: boolean = false
   * - numberOfItems?: number
   * - customMap?: (item: number | string, index: number) => any
   * - customCompare?: (item: number | string, items: (number | string)[], index: number) => boolean
   * - customLog?: (item: number | string, index: number, description: string, functionName: string) => void
   * - showLogs?: boolean = false
   * @returns { array } Returns array of random numbers
   * @example randomNumbers( 0, 10, { numberOfItems: 9, maximumDigitsAfterPoint: 2 })  ===>  [ 5.61, 4.36, 7.28, 0.3, 7.74, 5.93, 8.23, 1.36, 8.24]
   */
  public randomNumbers: randomNumbersType = (
    starting,
    ending,
    options = {}
  ) => {
    const dataObject = this.generateArray({ starting, ending }, options);
    return options.numberOfItems === undefined ? dataObject : dataObject.items;
  };

  public generateFromArgObject: randomNumbersArgType = ({
    inputs: { starting, ending },
    options,
  }) => {
    return this.randomNumbers(starting, ending, options);
  };
}

// * Random From Array

interface randomsFromArrayOptions
  extends baseFunctionOptions,
    randomFromArrayOptions {
  keepOrder?: boolean;
}

interface randomFromArrayOptions {}

interface randomsFromArrayInputs {
  arrayOfItems: unknown[];
}

type randomFromArrayType = (
  arrayOfItems: unknown[],
  options?: randomFromArrayOptions
) => unknown;

type randomsFromArrayType = (
  arrayOfItems: unknown[],
  options?: randomsFromArrayOptions
) => generateFunctionReturn | unknown[];

type randomsFromArrayArgType = ({
  inputs,
  options,
}: {
  inputs: randomsFromArrayInputs;
  options: randomsFromArrayOptions;
}) => generateFunctionReturn | unknown[];

class RandomFromArrayClass extends GeneratorFactory {
  constructor() {
    super();
    this.functionName = "randomFromArray";
  }

  protected functionName: string;

  protected uniqueErrorCheck = (
    inputs: randomsFromArrayInputs,
    options: randomsFromArrayOptions
  ) => {
    let { arrayOfItems } = inputs;
    arrayOfItems = [...new Set(arrayOfItems)];

    const maximumNumberOfItems = arrayOfItems.length;

    if (maximumNumberOfItems < options.numberOfItems) {
      this.showUniqueError(options);
      return false;
    }

    return options.unique;
  };
  protected generateItem: generateItemType = (
    { arrayOfItems }: randomsFromArrayInputs,
    options: randomsFromArrayOptions,
    index
  ) => {
    const item = options.keepOrder
      ? arrayOfItems[index % arrayOfItems.length]
      : arrayOfItems[Math.floor(Math.random() * arrayOfItems.length)];

    return { item };
  };

  /**
   * @param { array } arrayOfItems - Array of different elements
   * @returns { any } Returns an element that randomly chosen from given array
   * @example randomFromArray([ 9, 8, 4, {test:99})  ===>   8
   */
  public randomFromArray: randomFromArrayType = (arrayOfItems) => {
    return this.generateItem({ arrayOfItems }, {}, 0).item;
  };

  /**
   * @param { array } arrayOfItems - Array of different elements
   * @param { object } options - properties of options object
   * - keepOrder?: boolean = false
   * - unique?: boolean = false
   * - numberOfItems?: number
   * - customMap?: (item: number | string, index: number) => any
   * - customCompare?: (item: number | string, items: (number | string)[], index: number) => boolean
   * - customLog?: (item: number | string, index: number, description: string, functionName: string) => void
   * - showLogs?: boolean = false
   * @returns { array } Returns array of random elements that chosen from given array
   * @description By setting keepOrder to true it can create array without randomizing
   * @example randomsFromArray([ 9, 8, 4, {test:99}, [45]], { numberOfItems:4, unique:true })  ===>  [ [45], {test:99}, 9, 8 ]
   */
  public randomsFromArray: randomsFromArrayType = (
    arrayOfItems,
    options = {}
  ) => {
    const dataObject = this.generateArray({ arrayOfItems }, options);

    return options.numberOfItems === undefined ? dataObject : dataObject.items;
  };

  public generateFromArgObject: randomsFromArrayArgType = ({
    inputs: { arrayOfItems },
    options,
  }) => {
    return this.randomsFromArray(arrayOfItems, options);
  };
}
// * Random ID

interface randomIDsOptions extends baseFunctionOptions, randomIDOptions {}

interface randomIDOptions {
  charLib?: string[];
}

interface randomIDsInputs {
  minIDLength: number;
  maxIDLength: number;
}
type randomIDType = (
  minIDLength: number,
  maxIDLength: number,
  options?: randomIDOptions
) => string;

type randomIDsType = (
  minIDLength: number,
  maxIDLength: number,
  options?: randomIDsOptions
) => generateFunctionReturn | unknown[];

type randomIDsArgType = ({
  inputs,
  options,
}: {
  inputs: randomIDsInputs;
  options: randomIDsOptions;
}) => generateFunctionReturn | unknown[];

class randomIDClass extends GeneratorFactory {
  constructor() {
    super();
    this.functionName = "randomIDs";
  }

  protected functionName: string;

  protected charLibObject = {
    number: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    letter: [
      "a",
      "b",
      "c",
      "d",
      "e",
      "f",
      "g",
      "h",
      "i",
      "j",
      "k",
      "l",
      "m",
      "n",
      "o",
      "p",
      "q",
      "r",
      "s",
      "t",
      "u",
      "v",
      "w",
      "x",
      "y",
      "z",
      "A",
      "B",
      "C",
      "D",
      "E",
      "F",
      "G",
      "H",
      "I",
      "J",
      "K",
      "L",
      "M",
      "N",
      "O",
      "P",
      "Q",
      "R",
      "S",
      "T",
      "U",
      "V",
      "W",
      "X",
      "Y",
      "Z",
    ],
    symbol: [
      "~",
      "`",
      "!",
      "@",
      "#",
      "$",
      "%",
      "^",
      "&",
      "*",
      "(",
      ")",
      "_",
      "-",
      "+",
      "=",
      "{",
      "[",
      "}",
      "]",
      "|",
      "\\",
      ":",
      ";",
      '"',
      "'",
      "<",
      ",",
      ">",
      ".",
      "?",
      "/",
    ],
  };

  protected generateItem: generateItemType = (
    { minIDLength, maxIDLength }: randomIDsInputs,
    { charLib = ["number", "letter", "symbol"] }: randomIDsOptions
  ) => {
    const chars: string[] = [];

    const IDLength = Math.floor(
      Math.random() * (maxIDLength - minIDLength + 1) + minIDLength
    );

    for (let i = 0; i < IDLength; i++) {
      const randomLib =
        this.charLibObject[charLib[Math.floor(Math.random() * charLib.length)]];

      chars[i] = randomLib[Math.floor(Math.random() * randomLib.length)];
    }

    const item = chars.join("");

    return { item };
  };

  protected uniqueErrorCheck = (
    inputs: randomIDsInputs,
    options: randomIDsOptions = {}
  ) => {
    let maxArrLength: number = 0;

    if (options.charLib === undefined) {
      maxArrLength = 10 + 52 + 32;
    } else {
      options.charLib.forEach((element) => {
        switch (element) {
          case "number":
            maxArrLength += 10;
            break;
          case "letter":
            maxArrLength += 52;
            break;
          case "symbols":
            maxArrLength += 32;
            break;
          default:
            break;
        }
      });
    }
    let maxUniquePossibility: number = 0;
    for (let i = inputs.minIDLength; i < inputs.maxIDLength + 1; i++) {
      maxUniquePossibility += Math.pow(maxArrLength, i);
    }

    if (options.numberOfItems <= maxUniquePossibility) return true;
    else {
      this.showUniqueError(options);
      return false;
    }
  };

  /**
   * @param { number } minIDLength - min id length
   * @param { number } maxIDLength - max id length
   * @param { object } options - properties of options object
   * - charLib?: string[] = ["number", "letter" ,"symbol"]
   * @returns { string } Returns a string
   * @description Available libraries are  number, letter and symbol. To include a library put in charLib array as string.
   * @example randomID(5, 6)  ===>  "4//3A"
   */
  public randomID: randomIDType = (minIDLength, maxIDLength, options = {}) => {
    return this.generateItem({ minIDLength, maxIDLength }, options, 0)
      .item as string;
  };

  /**
   * @param { number } minIDLength - min id length
   * @param { number } maxIDLength - max id length
   * @param { object } options - properties of options object
   * - charLib?: string[] = ["number", "letter" ,"symbol"]
   * - unique?: boolean = false
   * - numberOfItems?: number
   * - customMap?: (item: number | string, index: number) => any
   * - customCompare?: (item: number | string, items: (number | string)[], index: number) => boolean
   * - customLog?: (item: number | string, index: number, description: string, functionName: string) => void
   * - showLogs?: boolean = false
   * @returns { array } Returns array of random strings
   * @description Available libraries are  number, letter and symbol. To include a library put in charLib array as string.
   * @example   randomIDs(5, 6, {numberOfItems: 4, unique: true, charLib: ["symbol", "letter"],})  ===> [ '_+|%Y', 'wzzn$', "sO;'Y`", '_KNdkn' ]
   */
  public randomIDs: randomIDsType = (
    minIDLength,
    maxIDLength,
    options = {}
  ) => {
    const dataObject = this.generateArray(
      { minIDLength, maxIDLength },
      options
    );

    return options.numberOfItems === undefined ? dataObject : dataObject.items;
  };

  public generateFromArgObject: randomIDsArgType = ({
    inputs: { minIDLength, maxIDLength },
    options,
  }) => {
    return this.randomIDs(minIDLength, maxIDLength, options);
  };
}

// * Gradual Value

interface gradualValueOptions extends baseFunctionOptions {
  incrementValue?: number;
}

interface gradualValueInputs {
  starting: number;
}

type gradualValueType = (
  starting: number,
  options?: gradualValueOptions
) => generateFunctionReturn | unknown[];

type gradualValueArgType = ({
  inputs,
  options,
}: {
  inputs: gradualValueInputs;
  options: gradualValueOptions;
}) => generateFunctionReturn | unknown[];

class GradualValueClass extends GeneratorFactory {
  constructor() {
    super();
    this.functionName = "gradualValue";
  }

  protected functionName: string;

  protected generateItem: generateItemType = (
    { starting }: gradualValueInputs,
    { incrementValue = 1 }: gradualValueOptions,
    index
  ) => {
    const item = starting + index * incrementValue;

    return { item };
  };

  protected uniqueErrorCheck = (
    inputs: gradualValueInputs,
    options: gradualValueOptions
  ) => {
    if (options.incrementValue === 0) {
      this.showUniqueError(options);
      return false;
    }

    return options.unique;
  };

  /**
   * @param { number } starting - Starting number
   * @param { object } options - properties of options object
   * - incrementValue?: number = 1
   * - unique?: boolean = false
   * - numberOfItems?: number
   * - customMap?: (item: number | string, index: number) => any
   * - customCompare?: (item: number | string, items: (number | string)[], index: number) => boolean
   * - customLog?: (item: number | string, index: number, description: string, functionName: string) => void
   * - showLogs?: boolean = false
   * @returns { array } Returns an array started with starting number and increased every item by incrementValue
   * @description It can be used for gradually increase a value between objects
   * @example gradualValue(5,{ numberOfItems:3, incrementValue: 5 })  ===>  [ 5, 10, 15 ]
   */
  public gradualValue: gradualValueType = (starting, options = {}) => {
    const dataObject = this.generateArray({ starting }, options);

    return options.numberOfItems === undefined ? dataObject : dataObject.items;
  };

  public generateFromArgObject: gradualValueArgType = ({
    inputs: { starting },
    options,
  }) => {
    return this.gradualValue(starting, options);
  };
}

// * Random Custom Function

interface randomCustomFunctionOptions extends baseFunctionOptions {}

interface randomCustomFunctionInputs {
  customFunction: (index: number) => unknown;
}

type randomCustomFunctionType = (
  customFunction: (index: number) => unknown,
  options?: randomCustomFunctionOptions
) => generateFunctionReturn | unknown[];

type randomCustomFunctionArgType = ({
  inputs,
  options,
}: {
  inputs: randomCustomFunctionInputs;
  options: randomCustomFunctionOptions;
}) => generateFunctionReturn | unknown[];

class RandomCustomFunctionClass extends GeneratorFactory {
  constructor() {
    super();
    this.functionName = "randomCustomFunction";
  }

  protected functionName: string;

  protected generateItem: generateItemType = (
    { customFunction }: randomCustomFunctionInputs,
    options,
    index
  ) => {
    const item = customFunction(index);

    return { item };
  };

  protected uniqueErrorCheck = (
    inputs: randomCustomFunctionInputs,
    options: randomCustomFunctionOptions
  ) => {
    return options.unique;
  };

  /**
   * @param { function } customFunction Custom function that returns one element
   * @param { object } options - properties of options object
   * - unique?: boolean = false
   * - numberOfItems?: number
   * - customMap?: (item: number | string, index: number) => any
   * - customCompare?: (item: number | string, items: (number | string)[], index: number) => boolean
   * - customLog?: (item: number | string, index: number, description: string, functionName: string) => void
   * - showLogs?: boolean = true
   * @returns { array }
   * @example randomCustomFunction(()=>{ return Date.now() },{ numberOfItems:3, unique: true })  ===>  [ 1686916732354, 1686916732355, 1686916732356 ]
   */
  randomCustomFunction: randomCustomFunctionType = (
    customFunction,
    options = {}
  ) => {
    if (options.showLogs === undefined) {
      options.showLogs = true;
    }

    const dataObject = this.generateArray({ customFunction }, options);

    return options.numberOfItems === undefined ? dataObject : dataObject.items;
  };

  public generateFromArgObject: randomCustomFunctionArgType = ({
    inputs: { customFunction },
    options,
  }) => {
    return this.randomCustomFunction(customFunction, options);
  };
}

// * Random String

interface randomStringsOptions
  extends baseFunctionOptions,
    randomStringOptions {}

interface randomStringOptions {
  separator?: string;
  lib?: string[];
}

interface randomStringsInputs {
  minNumberOfWords: number;
  maxNumberOfWords: number;
}

type randomStringType = (
  minNumberOfWords: number,
  maxNumberOfWords: number,
  options?: randomStringOptions
) => string;

type randomStringsType = (
  minNumberOfWords: number,
  maxNumberOfWords: number,
  options?: randomStringsOptions
) => generateFunctionReturn | unknown[];

type randomStringsArgType = ({
  inputs,
  options,
}: {
  inputs: randomStringsInputs;
  options: randomStringsOptions;
}) => generateFunctionReturn | unknown[];

class RandomStringClass extends GeneratorFactory {
  constructor() {
    super();
    this.functionName = "randomString";
  }
  protected functionName: string;

  protected stringLib = {
    name: listOfNames, //  6779
    adjective: listOfAdjectives, // 1314
    country: listOfCountries, // 193
    noun: listOfNouns, // 1000
  };

  protected generateItem: generateItemType = (
    { minNumberOfWords, maxNumberOfWords }: randomStringsInputs,
    {
      lib = ["name", "adjective", "country", "noun"],
      separator = "",
    }: randomStringsOptions
  ) => {
    let item: string = "";
    const wordCount = Math.floor(
      Math.random() * (maxNumberOfWords - minNumberOfWords + 1) +
        minNumberOfWords
    );

    for (let i = 0; i < wordCount; i++) {
      const randomLib =
        this.stringLib[lib[Math.floor(Math.random() * lib.length)]];

      item += randomLib[Math.floor(Math.random() * randomLib.length)];

      if (i + 1 !== wordCount) {
        item += separator;
      }
    }

    return { item };
  };

  /**
   * @param { number } minNumberOfWords - min number of words that result will contain
   * @param { number } maxNumberOfWords - max number of words that result will contain
   * @param { object } options - properties of options object
   * - separator?: string = ""
   * - lib?: string[] = ["name", "adjective", "country", "noun"]
   * @returns { string } Returns string
   * @description Available libraries are name, adjective, country and noun. To include a library put in lib array as string.
   * @example randomString(5, 6)  ===>  "focusedTanzaniacomposedchiefCeylon"
   */
  randomString: randomStringType = (
    minNumberOfWords,
    maxNumberOfWords,
    options = {}
  ) => {
    return this.generateItem({ minNumberOfWords, maxNumberOfWords }, options, 0)
      .item as string;
  };

  /**
   * @param { number } minIDLength - min number of words that result will contain
   * @param { number } maxIDLength - max number of words that result will contain
   * @param { object } options - properties of options object
   * - separator?: string = ""
   * - lib?: string[] = ["name", "adjective", "country", "noun"]
   * - unique?: boolean = false
   * - numberOfItems?: number
   * - customMap?: (item: number | string, index: number) => any
   * - customCompare?: (item: number | string, items: (number | string)[], index: number) => boolean
   * - customLog?: (item: number | string, index: number, description: string, functionName: string) => void
   * - showLogs?: boolean = false
   * @returns { Array } Returns Array of strings
   * @description Available libraries are name, adjective, country and noun. To include a library put in lib array as string.
   * @example randomStrings(1, 1, {lib: ["country"], numberOfItems: 5})  ===>  [ "Poland", "State of Palestine", "Austria", "Belize", "Bhutan" ]
   */
  randomStrings: randomStringsType = (
    minNumberOfWords,
    maxNumberOfWords,
    options = {}
  ) => {
    const dataObject = this.generateArray(
      { minNumberOfWords, maxNumberOfWords },
      options
    );

    return options.numberOfItems === undefined ? dataObject : dataObject.items;
  };

  protected uniqueErrorCheck: uniqueErrorCheckType = (
    inputs: randomStringsInputs,
    options: randomStringsOptions = {}
  ) => {
    let maxArrLength: number = 0;

    if (options.lib === undefined) {
      maxArrLength = 6779 + 1314 + 193 + 1000;
    } else {
      options.lib.forEach((element) => {
        switch (element) {
          case "name":
            maxArrLength += 6779;
            break;
          case "adjective":
            maxArrLength += 1314;
            break;
          case "country":
            maxArrLength += 193;
            break;
          case "noun":
            maxArrLength += 1000;
            break;
          default:
            break;
        }
      });
    }
    let maxUniquePossibility: number = 0;
    for (
      let i = inputs.minNumberOfWords;
      i < inputs.maxNumberOfWords + 1;
      i++
    ) {
      maxUniquePossibility += Math.pow(maxArrLength, i);
    }
    if (options.numberOfItems <= maxUniquePossibility) return true;
    else {
      this.showUniqueError(options);
      return false;
    }
  };

  public generateFromArgObject: randomStringsArgType = ({
    inputs,
    options,
  }) => {
    return this.randomStrings(
      inputs.minNumberOfWords,
      inputs.maxNumberOfWords,
      options
    );
  };
}

interface blueprint {
  [key: string]: generateFunctionReturn | unknown;
}

type randomObjectsType = (
  blueprint: blueprint,
  numberOfItems: number,
  optionsOverall?: {
    showLogs?: boolean;
    progressUpdate?: (index: number) => void;
  }
) => object[];

/**
 * @param { object } blueprint - Object that consists user-defined key and values. Values can be one item, functions that returns one item and functions that listed in description.
 * @param { number } numberOfItems
 * @returns { Array } Returns array of objects
 * @descriptions Listed functions should be used without specifying options.numberOfItems otherwise they will be accepted as one item.
 * - randomNumbers
 * - randomHexColors
 * - gradualValue
 * - randomsFromArray
 * - randomIDs
 * - randomCustomFunction
 * - randomStrings
 * - randomEmails
 * @example   randomObjects({
 * Number: randomNumbers(4, 50, { onlyIntegers: true }),
 * Hex: randomHexColors({ unique: true }),
 * Company: randomString(1, 1, { lib: ["noun"] }),
 * Planet: "Earth"}, 2 )  ===>
 * [{ Number: 32,
 *  Hex: '#95cfe7',
 *  Company: 'ground',
 *  Planet: 'Earth' },
 * {Number: 17,
 *  Hex: '#23a7ce',
 *  Company: 'ground',
 *  Planet: 'Earth' }]
 */
const randomObjects: randomObjectsType = (
  blueprint,
  numberOfItems,
  { showLogs = false, progressUpdate } = {}
) => {
  const keys: string[] = Object.keys(blueprint);

  const openedBlueprint = {};

  const resultArray: object[] = [];

  for (let i = 0; i < keys.length; i++) {
    const currentData: generateFunctionReturn | unknown = blueprint[keys[i]];

    if (!Object.keys(currentData).includes("functionData")) {
      openedBlueprint[keys[i]] = { data: currentData, single: true };
      continue;
    } else {
      const functionData: functionData = (currentData as generateFunctionReturn)
        .functionData;
      functionData.arguments.options.numberOfItems = numberOfItems;
      functionData.arguments.options.showLogs =
        functionData.arguments.options.showLogs || showLogs;

      const { inputs, options } = functionData.arguments;

      const res = functionData.functionCall({
        inputs,
        options,
      });

      openedBlueprint[keys[i]] = { data: res, single: false };

      if (progressUpdate) progressUpdate(i);
    }
  }

  for (let index = 0; index < numberOfItems; index++) {
    const currentObject = {};

    for (let i = 0; i < keys.length; i++) {
      const currentData: { data: unknown; single: boolean } =
        openedBlueprint[keys[i]];
      currentObject[keys[i]] = currentData.single
        ? currentData.data
        : currentData.data[index];
    }

    resultArray.push(currentObject);
  }

  return resultArray;
};

const {
  randomNumber,
  randomNumbers,
  generateFromArgObject: randomNumbersArg,
} = new RandomNumbersClass();
const { gradualValue, generateFromArgObject: gradualValueArg } =
  new GradualValueClass();
const {
  randomFromArray,
  randomsFromArray,
  generateFromArgObject: randomsFromArrayArg,
} = new RandomFromArrayClass();
const {
  randomID,
  randomIDs,
  generateFromArgObject: randomIDsArg,
} = new randomIDClass();
const { randomCustomFunction, generateFromArgObject: randomCustomFunctionArg } =
  new RandomCustomFunctionClass();
const {
  randomString,
  randomStrings,
  generateFromArgObject: randomStringsArg,
} = new RandomStringClass();

export = {
  randomNumber,
  randomNumbers,
  randomNumbersArg,
  gradualValue,
  gradualValueArg,
  randomFromArray,
  randomsFromArray,
  randomsFromArrayArg,
  randomID,
  randomIDs,
  randomIDsArg,
  randomCustomFunction,
  randomCustomFunctionArg,
  randomString,
  randomStrings,
  randomStringsArg,
  randomObjects,
};
