# random-objects

This project consists of multiple functions to create mock values.
And a function to create array of objects that uses those mock values.

## To install
```
$ npm install random-objects
```

## Simple usage

Before using I highly recommend to check the documentation.

```javascript
import {
  randomEmail,  
  randomEmails, 
  randomNumbers, 
  randomStrings, 
  randomIDs, 
  randomObjects} from "random-objects"


randomEmail();
//  "RoswellNoelia@university.dk"

randomNumbers(1, 100, {unique: true, numberOfItems: 5, onlyIntegers: true});
//   [5, 78, 98, 55, 12]

const blueprint = {
  name: randomStrings(2, 4, { lib: ["name"], separator: " " }),
  email: randomEmails(),
  number: randomIDs(10, 10, {
    unique: true,
    charLib: ["number"],
    customMap: (e, i) => "+90" + e,
  }),
};

randomObjects(blueprint, 3);
/*
[
  {
    name: 'Chloe Efrain Kierra',
    email: 'Georgeann@golf.fr',
    number: '+902047499537'
  },
  {
    name: 'Desi Chantel Lesli Avery',
    email: 'AmandaEthelene@sugar.es',
    number: '+903494952654'
  },
  {
    name: 'Arlyn Lilly Keyla',
    email: 'Arielle@term.jp',
    number: '+905784496945'
  }
]
*/


```

## Docs
You can check [this markdown file.](https://github.com/ensarkr/random-objects/blob/main/DOCS.md)

## Technologies
- Typescript


