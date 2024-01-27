import { listOfNames } from "./sources/listOfNames";
import { listOfAdjectives } from "./sources/listOfAdjectives";
import { listOfCountries } from "./sources/listOfCountries";
import { listOfNouns } from "./sources/listOfNouns";

type baseBlueprintOptions<POPULATED extends boolean> = POPULATED extends true
  ? {
      unique: boolean;
      progressUpdate: progressUpdateT;
      showLogs: boolean;
      reCreateLimit: number | null;
      customMap?(item: unknown, index: number): unknown;
      customCompare?(item: unknown, items: unknown[], index: number): boolean;
    }
  : {
      unique?: boolean;
      progressUpdate?: progressUpdateT;
      showLogs?: boolean;
      reCreateLimit?: number | null;
      customMap?(item: unknown, index: number): unknown;
      customCompare?(item: unknown, items: unknown[], index: number): boolean;
    };

type baseGeneratorOptions<POPULATED extends boolean> = POPULATED extends true
  ? {
      numberOfItems: number;
      unique: boolean;
      progressUpdate: progressUpdateT;
      showLogs: boolean;
      reCreateLimit: number | null;
      customMap?(item: unknown, index: number): unknown;
      customCompare?(item: unknown, items: unknown[], index: number): boolean;
    }
  : {
      numberOfItems?: number;
      unique?: boolean;
      progressUpdate?: progressUpdateT;
      showLogs?: boolean;
      reCreateLimit?: number | null;
      customMap?(item: unknown, index: number): unknown;
      customCompare?(item: unknown, items: unknown[], index: number): boolean;
    };

type progressUpdateT = {
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

type functionDataT = {
  functionOptions: allBlueprintOptionTypes<true>;
  functionCall: generateArrayType;
};

type allOptionTypes<POPULATED extends boolean> =
  | gradualValueOptions<POPULATED>
  | randomNumbersOptions<POPULATED>
  | randomFromArrayOptions<POPULATED>
  | randomCustomFunctionOptions<POPULATED>
  | randomStringsOptions<POPULATED>
  | randomArrayOptions<POPULATED>
  | randomIDsOptions<POPULATED>;

type allBlueprintOptionTypes<POPULATED extends boolean> =
  | gradualValueBlueprintOptions<POPULATED>
  | randomNumbersBlueprintOptions<POPULATED>
  | randomFromArrayBlueprintOptions<POPULATED>
  | randomCustomFunctionBlueprintOptions<POPULATED>
  | randomIDsBlueprintOptions<POPULATED>
  | randomArrayBlueprintOptions<POPULATED>
  | randomStringsBlueprintOptions<POPULATED>;

type generateItemType = (
  options: allOptionTypes<true>,
  index: number
) => unknown;

type uniqueErrorCheckType = (options: allOptionTypes<true>) => boolean;

type generateArrayType = (options: allOptionTypes<true>) => unknown[];

abstract class RandomGeneratorFactory {
  constructor() {}

  protected abstract functionName: string;
  protected abstract generateItem: generateItemType;
  protected abstract uniqueErrorCheck: uniqueErrorCheckType;

  protected generateArray: generateArrayType = (options) => {
    if (options.unique) {
      options.unique = this.uniqueErrorCheck(options);
    }

    const items: unknown[] = [];

    let indexCounter: number = 0;
    let recreateCount: number = 0;

    for (let index = 0; index < options.numberOfItems; index++) {
      const item = this.generateItem(options, index);

      if (
        !this.logsAndCustomFunctions(item, index, items, options) &&
        indexCounter === index
      ) {
        recreateCount++;
        if (
          options.reCreateLimit !== null &&
          recreateCount >= options.reCreateLimit
        ) {
          this.showUniqueError(options, options.reCreateLimit);
          options.unique = false;
          options.customCompare = undefined;
        }
        index--;
      } else {
        recreateCount = 0;
        indexCounter++;
      }
    }

    return items;
  };

  protected showUniqueError(options: allOptionTypes<true>, limit?: number) {
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
    options: allOptionTypes<true>
  ) {
    let compareResult: boolean = true;

    if (options.progressUpdate.afterItemCreated) {
      options.progressUpdate.afterItemCreated(item, index, this.functionName);
    }
    this.developerLog(options.showLogs, index, item, "item created");

    if (options.customMap) {
      item = options.customMap(item, index) as number | string;
    }

    if (options.progressUpdate.afterMap) {
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

    if (options.progressUpdate.afterCompare) {
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

    if (options.progressUpdate.afterUnique) {
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
    }

    return compareResult;
  }

  protected extractFunctionData(
    options: allBlueprintOptionTypes<true>
  ): functionDataT {
    return {
      functionOptions: options,
      functionCall: this.generateArray,
    };
  }
}

// * Random Numbers

type randomNumbersInputs<POPULATED extends boolean> = POPULATED extends true
  ? {
      starting: number;
      ending: number;
      onlyIntegers: boolean;
      maximumDigitsAfterPoint: number;
    }
  : {
      starting?: number;
      ending?: number;
      onlyIntegers?: boolean;
      maximumDigitsAfterPoint?: number;
    };

type randomNumbersOptions<POPULATED extends boolean> =
  randomNumbersInputs<POPULATED> & baseGeneratorOptions<POPULATED>;

type randomNumbersBlueprintOptions<POPULATED extends boolean> =
  randomNumbersInputs<POPULATED> & baseBlueprintOptions<POPULATED>;

type randomNumbersT = (options?: randomNumbersOptions<false>) => unknown[];

type randomNumbersBlueprintT = (
  options?: randomNumbersBlueprintOptions<false>
) => functionDataT;

class RandomNumbersClass extends RandomGeneratorFactory {
  constructor() {
    super();
    this.functionName = "randomNumbers";
  }

  protected functionName: string;

  protected populateOptions: <T extends "blueprint" | "generator">(
    type: T,
    options: T extends "blueprint"
      ? randomNumbersBlueprintOptions<false>
      : randomNumbersOptions<false>
  ) => T extends "blueprint"
    ? randomNumbersBlueprintOptions<true>
    : randomNumbersOptions<true> = (type, options) => {
    if (
      type === "generator" &&
      (options as randomNumbersOptions<false>).numberOfItems === undefined
    ) {
      (options as randomNumbersOptions<false>).numberOfItems = 100;
    }

    if (options.progressUpdate === undefined) {
      options.progressUpdate = {};
    }
    if (options.reCreateLimit === undefined) {
      options.reCreateLimit = 2000;
    }
    if (options.showLogs === undefined) {
      options.showLogs = false;
    }
    if (options.unique === undefined) {
      options.unique = false;
    }

    if (options.starting === undefined) {
      options.starting = 0;
    }
    if (options.ending === undefined) {
      options.ending = 100;
    }
    if (options.onlyIntegers === undefined) {
      options.onlyIntegers = true;
    }
    if (options.maximumDigitsAfterPoint === undefined) {
      options.maximumDigitsAfterPoint = 5;
    }

    return options as typeof type extends "blueprint"
      ? randomNumbersBlueprintOptions<true>
      : randomNumbersOptions<true>;
  };

  protected uniqueErrorCheck: uniqueErrorCheckType = (
    options: allOptionTypes<true>
  ) => {
    const optionsWithCorrectType = options as randomNumbersOptions<true>;

    let maximumNumberOfItems =
      optionsWithCorrectType.ending - optionsWithCorrectType.starting;

    if (
      !optionsWithCorrectType.onlyIntegers &&
      optionsWithCorrectType.maximumDigitsAfterPoint !== undefined
    ) {
      maximumNumberOfItems *= Math.pow(
        10,
        optionsWithCorrectType.maximumDigitsAfterPoint
      );
    }

    maximumNumberOfItems = maximumNumberOfItems == 0 ? 1 : maximumNumberOfItems;

    if (maximumNumberOfItems < optionsWithCorrectType.numberOfItems) {
      this.showUniqueError(optionsWithCorrectType);
      return false;
    }

    return optionsWithCorrectType.unique;
  };

  protected generateItem: generateItemType = (
    options: allOptionTypes<true>
  ) => {
    const optionsWithCorrectType = options as randomNumbersOptions<true>;

    let item;

    item =
      Math.random() *
        (optionsWithCorrectType.ending - optionsWithCorrectType.starting) +
      optionsWithCorrectType.starting;

    if (optionsWithCorrectType.onlyIntegers) {
      item = Math.floor(item as number);
    } else {
      const afterPoint =
        optionsWithCorrectType.maximumDigitsAfterPoint === 0
          ? 0
          : Math.floor(
              Math.random() *
                Math.pow(10, optionsWithCorrectType.maximumDigitsAfterPoint)
            ).toString().length;

      if (item.toString().includes(".")) {
        item = Number.parseFloat(
          item.toString().split(".")[0] +
            "." +
            item.toString().split(".")[1].substring(0, afterPoint)
        );
      }
    }

    return item;
  };

  public randomNumbers: randomNumbersT = (options = {}) => {
    const populatedOptions = this.populateOptions("generator", options);
    return this.generateArray(populatedOptions);
  };

  public randomNumbersBlueprint: randomNumbersBlueprintT = (options = {}) => {
    const populatedOptions = this.populateOptions("blueprint", options);
    return this.extractFunctionData(populatedOptions);
  };
}

// * Random From Array

type randomFromArrayInputs<POPULATED extends boolean> = POPULATED extends true
  ? {
      arrayOfItems: unknown[];
      keepOrder: boolean;
    }
  : {
      arrayOfItems: unknown[];
      keepOrder?: boolean;
    };

type randomFromArrayOptions<POPULATED extends boolean> =
  randomFromArrayInputs<POPULATED> & baseGeneratorOptions<POPULATED>;

type randomFromArrayBlueprintOptions<POPULATED extends boolean> =
  randomFromArrayInputs<POPULATED> & baseBlueprintOptions<POPULATED>;

type randomFromArrayT = (options: randomFromArrayOptions<false>) => unknown[];

type randomFromArrayBlueprintT = (
  options: randomFromArrayBlueprintOptions<false>
) => functionDataT;

class RandomFromArrayClass extends RandomGeneratorFactory {
  constructor() {
    super();
    this.functionName = "randomFromArray";
  }

  protected functionName: string;

  protected populateOptions: <T extends "blueprint" | "generator">(
    type: T,
    options: T extends "blueprint"
      ? randomFromArrayBlueprintOptions<false>
      : randomFromArrayOptions<false>
  ) => T extends "blueprint"
    ? randomFromArrayBlueprintOptions<true>
    : randomFromArrayOptions<true> = (type, options) => {
    if (
      type === "generator" &&
      (options as randomFromArrayOptions<false>).numberOfItems === undefined
    ) {
      (options as randomFromArrayOptions<false>).numberOfItems = 100;
    }

    if (options.progressUpdate === undefined) {
      options.progressUpdate = {};
    }
    if (options.reCreateLimit === undefined) {
      options.reCreateLimit = 2000;
    }
    if (options.showLogs === undefined) {
      options.showLogs = false;
    }
    if (options.unique === undefined) {
      options.unique = false;
    }

    if (options.arrayOfItems === undefined) {
      throw Error("Options parameter must have arrayOfItems property.");
    }
    if (options.keepOrder === undefined) {
      options.keepOrder = false;
    }

    return options as typeof type extends "blueprint"
      ? randomFromArrayBlueprintOptions<true>
      : randomFromArrayOptions<true>;
  };

  protected uniqueErrorCheck = (options: allOptionTypes<true>) => {
    const optionsWithCorrectType = options as randomFromArrayOptions<true>;

    let { arrayOfItems } = optionsWithCorrectType;
    arrayOfItems = [...new Set(arrayOfItems)];

    const maximumNumberOfItems = arrayOfItems.length;

    if (maximumNumberOfItems < optionsWithCorrectType.numberOfItems) {
      this.showUniqueError(optionsWithCorrectType);
      return false;
    }

    return options.unique;
  };

  protected generateItem: generateItemType = (
    options: allOptionTypes<true>,
    index
  ) => {
    const optionsWithCorrectType = options as randomFromArrayOptions<true>;

    const item = optionsWithCorrectType.keepOrder
      ? optionsWithCorrectType.arrayOfItems[
          index % optionsWithCorrectType.arrayOfItems.length
        ]
      : optionsWithCorrectType.arrayOfItems[
          Math.floor(Math.random() * optionsWithCorrectType.arrayOfItems.length)
        ];

    return item;
  };

  public randomFromArray: randomFromArrayT = (options) => {
    const populatedOptions = this.populateOptions("generator", options);
    return this.generateArray(populatedOptions);
  };

  public randomFromArrayBlueprint: randomFromArrayBlueprintT = (options) => {
    const populatedOptions = this.populateOptions("blueprint", options);
    return this.extractFunctionData(populatedOptions);
  };
}

// * Random ID

type charLibs = "number" | "letter" | "symbol";

type randomIDsInputs<POPULATED extends boolean> = POPULATED extends true
  ? {
      minIDLength: number;
      maxIDLength: number;
      charLib: charLibs[];
    }
  : {
      minIDLength?: number;
      maxIDLength?: number;
      charLib?: charLibs[];
    };

type randomIDsOptions<POPULATED extends boolean> = randomIDsInputs<POPULATED> &
  baseGeneratorOptions<POPULATED>;

type randomIDsBlueprintOptions<POPULATED extends boolean> =
  randomIDsInputs<POPULATED> & baseBlueprintOptions<POPULATED>;

type randomIDsT = (options?: randomIDsOptions<false>) => unknown[];

type randomIDsBlueprintT = (
  options?: randomIDsBlueprintOptions<false>
) => functionDataT;

class RandomIDsClass extends RandomGeneratorFactory {
  constructor() {
    super();
    this.functionName = "randomIDs";
  }

  protected functionName: string;

  protected charLibObject = {
    number: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
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

  protected populateOptions: <T extends "blueprint" | "generator">(
    type: T,
    options: T extends "blueprint"
      ? randomIDsBlueprintOptions<false>
      : randomIDsOptions<false>
  ) => T extends "blueprint"
    ? randomIDsBlueprintOptions<true>
    : randomIDsOptions<true> = (type, options) => {
    if (
      type === "generator" &&
      (options as randomIDsOptions<false>).numberOfItems === undefined
    ) {
      (options as randomIDsOptions<false>).numberOfItems = 100;
    }

    if (options.progressUpdate === undefined) {
      options.progressUpdate = {};
    }
    if (options.reCreateLimit === undefined) {
      options.reCreateLimit = 2000;
    }
    if (options.showLogs === undefined) {
      options.showLogs = false;
    }
    if (options.unique === undefined) {
      options.unique = false;
    }

    if (options.minIDLength === undefined) {
      options.minIDLength = 16;
    }
    if (options.maxIDLength === undefined) {
      options.maxIDLength = 8;
    }
    if (options.charLib === undefined) {
      options.charLib = ["letter", "number", "number"];
    }

    return options as typeof type extends "blueprint"
      ? randomIDsBlueprintOptions<true>
      : randomIDsOptions<true>;
  };

  protected generateItem: generateItemType = (options) => {
    const optionsWithCorrectType = options as randomIDsOptions<true>;

    const chars: string[] = [];

    const IDLength = Math.floor(
      Math.random() *
        (optionsWithCorrectType.maxIDLength -
          optionsWithCorrectType.minIDLength +
          1) +
        optionsWithCorrectType.minIDLength
    );

    for (let i = 0; i < IDLength; i++) {
      const randomLib =
        this.charLibObject[
          optionsWithCorrectType.charLib[
            Math.floor(Math.random() * optionsWithCorrectType.charLib.length)
          ]
        ];

      chars[i] = randomLib[Math.floor(Math.random() * randomLib.length)];
    }

    const item = chars.join("");

    return item;
  };

  protected uniqueErrorCheck = (options: allOptionTypes<true>) => {
    const optionsWithCorrectType = options as randomIDsOptions<true>;

    let maxArrLength: number = 0;

    if (optionsWithCorrectType.charLib === undefined) {
      maxArrLength = 10 + 52 + 32;
    } else {
      optionsWithCorrectType.charLib.forEach((element) => {
        switch (element) {
          case "number":
            maxArrLength += 10;
            break;
          case "letter":
            maxArrLength += 52;
            break;
          case "symbol":
            maxArrLength += 32;
            break;
          default:
            break;
        }
      });
    }
    let maxUniquePossibility: number = 0;
    for (
      let i = optionsWithCorrectType.minIDLength;
      i < optionsWithCorrectType.maxIDLength + 1;
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

  public randomIDs: randomIDsT = (options = {}) => {
    const populatedOptions = this.populateOptions("generator", options);
    return this.generateArray(populatedOptions);
  };

  public randomIDsBlueprint: randomIDsBlueprintT = (options = {}) => {
    const populatedOptions = this.populateOptions("blueprint", options);
    return this.extractFunctionData(populatedOptions);
  };
}

// * Gradual Value

type gradualValueInputs<POPULATED extends boolean> = POPULATED extends true
  ? {
      starting: number;
      incrementValue: number;
    }
  : {
      starting?: number;
      incrementValue?: number;
    };

type gradualValueOptions<POPULATED extends boolean> =
  gradualValueInputs<POPULATED> & baseGeneratorOptions<POPULATED>;

type gradualValueBlueprintOptions<POPULATED extends boolean> =
  gradualValueInputs<POPULATED> & baseBlueprintOptions<POPULATED>;

type gradualValueT = (options?: gradualValueOptions<false>) => unknown[];

type gradualValueBlueprintT = (
  options?: gradualValueBlueprintOptions<false>
) => functionDataT;

class GradualValueClass extends RandomGeneratorFactory {
  constructor() {
    super();
    this.functionName = "gradualValue";
  }

  protected functionName: string;

  protected populateOptions: <T extends "blueprint" | "generator">(
    type: T,
    options: T extends "blueprint"
      ? gradualValueBlueprintOptions<false>
      : gradualValueOptions<false>
  ) => T extends "blueprint"
    ? gradualValueBlueprintOptions<true>
    : gradualValueOptions<true> = (type, options) => {
    if (
      type === "generator" &&
      (options as gradualValueOptions<false>).numberOfItems === undefined
    ) {
      (options as gradualValueOptions<false>).numberOfItems = 100;
    }

    if (options.progressUpdate === undefined) {
      options.progressUpdate = {};
    }
    if (options.reCreateLimit === undefined) {
      options.reCreateLimit = 2000;
    }
    if (options.showLogs === undefined) {
      options.showLogs = false;
    }
    if (options.unique === undefined) {
      options.unique = false;
    }

    if (options.starting === undefined) {
      options.starting = 0;
    }
    if (options.incrementValue === undefined) {
      options.incrementValue = 1;
    }

    return options as typeof type extends "blueprint"
      ? gradualValueBlueprintOptions<true>
      : gradualValueOptions<true>;
  };

  protected generateItem: generateItemType = (options, index) => {
    const optionsWithCorrectType = options as gradualValueOptions<true>;

    const item =
      optionsWithCorrectType.starting +
      index * optionsWithCorrectType.incrementValue;

    return item;
  };

  protected uniqueErrorCheck = (options: allOptionTypes<true>) => {
    const optionsWithCorrectType = options as gradualValueOptions<true>;

    if (optionsWithCorrectType.incrementValue === 0) {
      this.showUniqueError(options);
      return false;
    }

    return options.unique;
  };

  public gradualValue: gradualValueT = (options = {}) => {
    const populatedOptions = this.populateOptions("generator", options);
    return this.generateArray(populatedOptions);
  };

  public gradualValueBlueprint: gradualValueBlueprintT = (options = {}) => {
    const populatedOptions = this.populateOptions("blueprint", options);
    return this.extractFunctionData(populatedOptions);
  };
}

// * Random Custom Function

type randomCustomFunctionInputs = {
  customFunction: (index: number) => unknown;
};

type randomCustomFunctionOptions<POPULATED extends boolean> =
  randomCustomFunctionInputs & baseGeneratorOptions<POPULATED>;

type randomCustomFunctionBlueprintOptions<POPULATED extends boolean> =
  randomCustomFunctionInputs & baseBlueprintOptions<POPULATED>;

type randomCustomFunctionT = (
  options: randomCustomFunctionOptions<false>
) => unknown[];

type randomCustomFunctionBlueprintT = (
  options: randomCustomFunctionBlueprintOptions<false>
) => functionDataT;

class RandomCustomFunctionClass extends RandomGeneratorFactory {
  constructor() {
    super();
    this.functionName = "randomCustomFunction";
  }

  protected functionName: string;

  protected populateOptions: <T extends "blueprint" | "generator">(
    type: T,
    options: T extends "blueprint"
      ? randomCustomFunctionBlueprintOptions<false>
      : randomCustomFunctionOptions<false>
  ) => T extends "blueprint"
    ? randomCustomFunctionBlueprintOptions<true>
    : randomCustomFunctionOptions<true> = (type, options) => {
    if (
      type === "generator" &&
      (options as randomCustomFunctionOptions<false>).numberOfItems ===
        undefined
    ) {
      (options as randomCustomFunctionOptions<false>).numberOfItems = 100;
    }

    if (options.progressUpdate === undefined) {
      options.progressUpdate = {};
    }
    if (options.reCreateLimit === undefined) {
      options.reCreateLimit = 2000;
    }
    if (options.showLogs === undefined) {
      options.showLogs = true;
    }
    if (options.unique === undefined) {
      options.unique = false;
    }

    return options as typeof type extends "blueprint"
      ? randomCustomFunctionBlueprintOptions<true>
      : randomCustomFunctionOptions<true>;
  };

  protected generateItem: generateItemType = (options, index) => {
    const optionsWithCorrectType = options as randomCustomFunctionOptions<true>;
    return optionsWithCorrectType.customFunction(index);
  };

  protected uniqueErrorCheck = (options: allOptionTypes<true>) => {
    const optionsWithCorrectType = options as randomCustomFunctionOptions<true>;
    return optionsWithCorrectType.unique;
  };

  public randomCustomFunction: randomCustomFunctionT = (options) => {
    const populatedOptions = this.populateOptions("generator", options);
    return this.generateArray(populatedOptions);
  };

  public randomCustomFunctionBlueprint: randomCustomFunctionBlueprintT = (
    options
  ) => {
    const populatedOptions = this.populateOptions("blueprint", options);
    return this.extractFunctionData(populatedOptions);
  };
}

// * Random String

type wordLibs = "name" | "adjective" | "country" | "noun";

type randomStringsInputs<POPULATED extends boolean> = POPULATED extends true
  ? {
      minNumberOfWords: number;
      maxNumberOfWords: number;
      separator: string;
      lib: wordLibs[];
    }
  : {
      minNumberOfWords?: number;
      maxNumberOfWords?: number;
      separator?: string;
      lib?: wordLibs[];
    };

type randomStringsOptions<POPULATED extends boolean> =
  randomStringsInputs<POPULATED> & baseGeneratorOptions<POPULATED>;

type randomStringsBlueprintOptions<POPULATED extends boolean> =
  randomStringsInputs<POPULATED> & baseBlueprintOptions<POPULATED>;

type randomStringsT = (options?: randomStringsOptions<false>) => unknown[];

type randomStringsBlueprintT = (
  options?: randomStringsBlueprintOptions<false>
) => functionDataT;

class RandomStringsClass extends RandomGeneratorFactory {
  constructor() {
    super();
    this.functionName = "randomStrings";
  }
  protected functionName: string;

  protected stringLib = {
    name: listOfNames, //  6779
    adjective: listOfAdjectives, // 1314
    country: listOfCountries, // 193
    noun: listOfNouns, // 1000
  };

  protected populateOptions: <T extends "blueprint" | "generator">(
    type: T,
    options: T extends "blueprint"
      ? randomStringsBlueprintOptions<false>
      : randomStringsOptions<false>
  ) => T extends "blueprint"
    ? randomStringsBlueprintOptions<true>
    : randomStringsOptions<true> = (type, options) => {
    if (
      type === "generator" &&
      (options as randomStringsOptions<false>).numberOfItems === undefined
    ) {
      (options as randomStringsOptions<false>).numberOfItems = 100;
    }

    if (options.progressUpdate === undefined) {
      options.progressUpdate = {};
    }
    if (options.reCreateLimit === undefined) {
      options.reCreateLimit = 2000;
    }
    if (options.showLogs === undefined) {
      options.showLogs = false;
    }
    if (options.unique === undefined) {
      options.unique = false;
    }

    if (options.minNumberOfWords === undefined) {
      options.minNumberOfWords = 2;
    }
    if (options.maxNumberOfWords === undefined) {
      options.maxNumberOfWords = 3;
    }
    if (options.lib === undefined) {
      options.lib = ["name", "adjective"];
    }
    if (options.separator === undefined) {
      options.separator = " ";
    }

    return options as typeof type extends "blueprint"
      ? randomStringsBlueprintOptions<true>
      : randomStringsOptions<true>;
  };

  protected uniqueErrorCheck: uniqueErrorCheckType = (
    options: allOptionTypes<true>
  ) => {
    const optionsWithCorrectType = options as randomStringsOptions<true>;

    let maxArrLength: number = 0;

    if (optionsWithCorrectType.lib === undefined) {
      maxArrLength = 6779 + 1314 + 193 + 1000;
    } else {
      optionsWithCorrectType.lib.forEach((element) => {
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
      let i = optionsWithCorrectType.minNumberOfWords;
      i < optionsWithCorrectType.maxNumberOfWords + 1;
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

  protected generateItem: generateItemType = (options) => {
    const optionsWithCorrectType = options as randomStringsOptions<true>;

    let item: string = "";
    const wordCount = Math.floor(
      Math.random() *
        (optionsWithCorrectType.maxNumberOfWords -
          optionsWithCorrectType.minNumberOfWords +
          1) +
        optionsWithCorrectType.minNumberOfWords
    );

    for (let i = 0; i < wordCount; i++) {
      const randomLib =
        this.stringLib[
          optionsWithCorrectType.lib[
            Math.floor(Math.random() * optionsWithCorrectType.lib.length)
          ] as keyof typeof this.stringLib
        ];

      item += randomLib[Math.floor(Math.random() * randomLib.length)];

      if (i + 1 !== wordCount) {
        item += optionsWithCorrectType.separator;
      }
    }

    return item;
  };

  public randomStrings: randomStringsT = (options = {}) => {
    const populatedOptions = this.populateOptions("generator", options);
    return this.generateArray(populatedOptions);
  };

  public randomStringsBlueprint: randomStringsBlueprintT = (options = {}) => {
    const populatedOptions = this.populateOptions("generator", options);
    return this.extractFunctionData(populatedOptions);
  };
}

// * Random Array

type randomArrayInputs<POPULATED extends boolean> = POPULATED extends true
  ? {
      arrayOfItems: unknown[];
      minLengthOfArray: number;
      maxLengthOfArray: number;
      keepOrder: boolean;
      allowDuplicates: boolean;
    }
  : {
      arrayOfItems: unknown[];
      minLengthOfArray?: number;
      maxLengthOfArray?: number;
      keepOrder?: boolean;
      allowDuplicates?: boolean;
    };

type randomArrayOptions<POPULATED extends boolean> =
  randomArrayInputs<POPULATED> & baseGeneratorOptions<POPULATED>;

type randomArrayBlueprintOptions<POPULATED extends boolean> =
  randomArrayInputs<POPULATED> & baseBlueprintOptions<POPULATED>;

type randomArrayT = (options: randomArrayOptions<false>) => unknown[];

type randomArrayBlueprintT = (
  options: randomArrayBlueprintOptions<false>
) => functionDataT;

class RandomArrayClass extends RandomGeneratorFactory {
  constructor() {
    super();
    this.functionName = "randomArray";
  }

  protected functionName: string;

  protected populateOptions: <T extends "blueprint" | "generator">(
    type: T,
    options: T extends "blueprint"
      ? randomArrayBlueprintOptions<false>
      : randomArrayOptions<false>
  ) => T extends "blueprint"
    ? randomArrayBlueprintOptions<true>
    : randomArrayOptions<true> = (type, options) => {
    if (
      type === "generator" &&
      (options as randomArrayOptions<false>).numberOfItems === undefined
    ) {
      (options as randomArrayOptions<false>).numberOfItems = 100;
    }

    if (options.progressUpdate === undefined) {
      options.progressUpdate = {};
    }
    if (options.reCreateLimit === undefined) {
      options.reCreateLimit = 2000;
    }
    if (options.showLogs === undefined) {
      options.showLogs = false;
    }
    if (options.unique === undefined) {
      options.unique = false;
    }

    if (options.arrayOfItems === undefined) {
      throw Error("arrayOfItems property must be defined.");
    }
    if (options.allowDuplicates === undefined) {
      options.allowDuplicates = false;
    }
    if (options.keepOrder === undefined) {
      options.keepOrder = false;
    }
    if (options.minLengthOfArray === undefined) {
      options.minLengthOfArray = 1;
    }
    if (options.maxLengthOfArray === undefined) {
      options.maxLengthOfArray = options.arrayOfItems.length - 1;
    }

    return options as typeof type extends "blueprint"
      ? randomArrayBlueprintOptions<true>
      : randomArrayOptions<true>;
  };

  protected uniqueErrorCheck = (options: allOptionTypes<true>) => {
    const optionsWithCorrectType = options as randomArrayOptions<true>;
    // TODO: add proper one

    if (optionsWithCorrectType.allowDuplicates === false) {
      const uniqueItemsCount = [...new Set(optionsWithCorrectType.arrayOfItems)]
        .length;

      if (
        optionsWithCorrectType.maxLengthOfArray > uniqueItemsCount ||
        optionsWithCorrectType.minLengthOfArray > uniqueItemsCount
      ) {
        optionsWithCorrectType.allowDuplicates = true;
      }
    }
    return options.unique;
  };

  protected generateItem: generateItemType = (
    options: allOptionTypes<true>
  ) => {
    const optionsWithCorrectType = options as randomArrayOptions<true>;

    const resultLength = Math.floor(
      Math.random() *
        (optionsWithCorrectType.maxLengthOfArray -
          optionsWithCorrectType.minLengthOfArray) +
        optionsWithCorrectType.minLengthOfArray
    );

    const uniqueItems = [...new Set(optionsWithCorrectType.arrayOfItems)];

    const itemArray: unknown[] = [];

    for (let i = 0; i < resultLength; i++) {
      if (optionsWithCorrectType.allowDuplicates) {
        itemArray.push(
          uniqueItems[Math.floor(Math.random() * uniqueItems.length)]
        );
      } else {
        const item =
          uniqueItems[Math.floor(Math.random() * uniqueItems.length)];

        if (!itemArray.includes(item)) itemArray.push(item);
        else {
          i--;
          continue;
        }
      }
    }

    if (optionsWithCorrectType.keepOrder) {
      itemArray.sort((a, b) => {
        if (optionsWithCorrectType.allowDuplicates === true && a === b)
          return 0;

        return uniqueItems.indexOf(a) - uniqueItems.indexOf(b);
      });
    }

    return itemArray;
  };

  public randomArray: randomArrayT = (options) => {
    const populatedOptions = this.populateOptions("generator", options);
    return this.generateArray(populatedOptions);
  };

  public randomArrayBlueprint: randomArrayBlueprintT = (options) => {
    const populatedOptions = this.populateOptions("blueprint", options);
    return this.extractFunctionData(populatedOptions);
  };
}

type blueprint = {
  [key: string]: functionDataT | unknown;
};

type randomObjectsT = (
  blueprint: blueprint,
  numberOfItems: number,
  optionsOverall?: {
    showLogs?: boolean;
    progressUpdate?: (index: number) => void;
  }
) => Record<string, unknown>[];

const randomObjects: randomObjectsT = (
  blueprint,
  numberOfItems,
  { showLogs = false, progressUpdate } = {}
) => {
  const keys: string[] = Object.keys(blueprint);

  const openedBlueprint: Record<
    string,
    { items: unknown[]; static: false } | { item: unknown; static: true }
  > = {};

  const resultArray: Record<string, unknown>[] = [];

  for (let i = 0; i < keys.length; i++) {
    const currentData: functionDataT | unknown = blueprint[keys[i]];

    if (typeof currentData !== "object") {
      openedBlueprint[keys[i]] = {
        item: currentData,
        static: true,
      };
      continue;
    } else if (
      !Object.keys(currentData as object).includes("functionOptions")
    ) {
      openedBlueprint[keys[i]] = {
        item: currentData,
        static: true,
      };
      continue;
    } else {
      const functionData: functionDataT = currentData as functionDataT;

      const options = functionData.functionOptions;

      const items = functionData.functionCall({
        ...options,
        numberOfItems,
        showLogs,
      });

      openedBlueprint[keys[i]] = { items, static: false };

      if (progressUpdate) progressUpdate(i);
    }
  }

  for (let index = 0; index < numberOfItems; index++) {
    const currentObject: Record<string, unknown> = {};

    for (let i = 0; i < keys.length; i++) {
      const currentData = openedBlueprint[keys[i]];
      currentObject[keys[i]] = currentData.static
        ? currentData.item
        : currentData.items[index];
    }

    resultArray.push(currentObject);
  }

  return resultArray;
};

const { randomNumbers, randomNumbersBlueprint } = new RandomNumbersClass();
const { gradualValue, gradualValueBlueprint } = new GradualValueClass();
const { randomFromArray, randomFromArrayBlueprint } =
  new RandomFromArrayClass();
const { randomIDs, randomIDsBlueprint } = new RandomIDsClass();
const { randomCustomFunction, randomCustomFunctionBlueprint } =
  new RandomCustomFunctionClass();
const { randomStrings, randomStringsBlueprint } = new RandomStringsClass();
const { randomArray, randomArrayBlueprint } = new RandomArrayClass();

export {
  randomNumbers,
  randomNumbersBlueprint,
  gradualValue,
  gradualValueBlueprint,
  randomFromArray,
  randomFromArrayBlueprint,
  randomIDs,
  randomIDsBlueprint,
  randomCustomFunction,
  randomCustomFunctionBlueprint,
  randomStrings,
  randomStringsBlueprint,
  randomArray,
  randomArrayBlueprint,
  randomObjects,
};
