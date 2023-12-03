# random-objects

This project consists of multiple functions to create mock values.
And a function to create array of objects that uses those mock values.

## To install

```
$ npm install random-objects
```

## Simple usage

```javascript
import {
  randomNumbers,
  randomNumbersBlueprint,
  randomStringsBlueprint,
  randomIDsBlueprint,
  randomObjects,
} from "random-objects";

randomNumbers({
  starting: 0,
  ending: 100,
  unique: true,
  numberOfItems: 5,
  onlyIntegers: true,
});

// [ 47, 80, 69, 70, 40 ]

const blueprint = {
  name: randomStringsBlueprint({
    minNumberOfWords: 2,
    maxNumberOfWords: 4,
    lib: ["name"],
    separator: " ",
  }),
  age: randomNumbersBlueprint({
    starting: 18,
    ending: 99,
  }),
  phoneNumber: randomIDsBlueprint({
    minIDLength: 10,
    maxIDLength: 10,
    unique: true,
    charLib: ["number"],
    customMap: (e, i) => "+90" + e,
  }),
};

randomObjects(blueprint, 3);

/*
[
  {
    name: 'Rennie Eveline Braylon',
    age: 44,
    phoneNumber: '+907877401684'
  },
  {
    name: 'Chanie Tyson Bobbi',
    age: 54,
    phoneNumber: '+901441685782'
  },
  {
    name: 'Edie Leilani Wilbur',
    age: 79,
    phoneNumber: '+901625566734'
  }
]
*/
```

## Technologies

- Typescript
- ts-jest
