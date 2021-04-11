const metadataSymbol = Symbol("metadata");

interface Metadata {
  keys: PropertyMetadata[];
}

interface PropertyMetadata<Serialized = any, Deserialized = Serialized> {
  key: string;
  serializedKey: string;
  serializer?: (deserialized: Deserialized) => Serialized;
  deserializer?: (serialized: Serialized) => Deserialized;
}

function getMetadata(constructor: Function): Metadata | undefined {
  return constructor.prototype[metadataSymbol];
}

function hasMetadata(constructor: Function) {
  return getMetadata(constructor) !== undefined;
}

function defineMetadata(constructor: Function, data: Metadata) {
  constructor.prototype[metadataSymbol] = data;
}

type PropertyOptions = string | Omit<PropertyMetadata, "key">;

export function Property(_opts?: PropertyOptions) {
  return function (target: any, propertyKey: string) {
    if (!hasMetadata(target.constructor)) {
      defineMetadata(target.constructor, {
        keys: [],
      });
    }

    let opts: PropertyMetadata;
    // normalize the property metadata
    switch (typeof _opts) {
      case "string":
        opts = {
          key: propertyKey,
          serializedKey: _opts,
        };
        break;
      case "undefined":
        opts = {
          key: propertyKey,
          serializedKey: propertyKey,
        };
        break;
      default:
        opts = { key: propertyKey, ..._opts };
    }

    const meta = getMetadata(target.constructor)!;
    meta.keys.push(opts);
  };
}

export class Bargain<T extends Function[]> {
  constructor(public definitions: T) {}

  /**
   * Turns an instance of a class into a prototype-less object (no longer an instance of the class).
   * @param instance
   * @returns
   */
  serialize<F extends T[number]["prototype"]>(instance: F) {
    if (!hasMetadata(instance.constructor)) {
      throw Error(
        "Instance constructor does not have any metadata included. Did you forget to include the decorators?"
      );
    }

    const meta = getMetadata(instance.constructor)!;

    const draft: Record<string, unknown> = {};

    for (const { serializer, key: propertyKey, serializedKey } of meta.keys) {
      const instanceValue = (instance as any)[propertyKey];
      const serializedValue =
        serializer !== undefined ? serializer(instanceValue) : instanceValue;

      draft[serializedKey] = serializedValue;
    }

    return draft;
  }

  /**
   * Turns the serialized data into an instance of a class.
   * @param serialized
   */
  deserialize<F extends T[number]>(
    serialized: unknown,
    classDef: F
  ): F["prototype"] {
    const draft = {};
    const meta = getMetadata(classDef)!;

    for (const { deserializer, key: propertyKey, serializedKey } of meta.keys) {
      const curValue = (serialized as any)[serializedKey];
      const deserializedVal =
        deserializer !== undefined ? deserializer(curValue) : curValue;

      (draft as any)[propertyKey] = deserializedVal;
    }
    return Object.assign(classDef.prototype, draft as any);
  }
}
