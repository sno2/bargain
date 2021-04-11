# @bargain/core

A simple TypeScript decorator-based library for serializing and deserializing data.

## Usage

Before you get started, make sure that you update your `tsconfig.json` to include the following to enable TypeScript decorators:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

After, that you can import any of the package members into your code.

```ts
import { Property, Bargain } from "@bargain/core";

class Person {
  @Property()
  name: string = "Carter";

  formatFullName(lastName: string) {
    return `${this.name} ${lastName}`;
  }
}

const bargain = new Bargain(); // initializes bargain

const person = new Person(); // Person { name: "Carter" }
const personFullName = person.formatFullName("Foo"); // "Carter Foo"

const serializedPerson = bargain.serialize(person); // { name: "Carter" }

console.log(serializedPerson.formatFullName); // undefined
```

## License

[MIT](./LICENSE)
