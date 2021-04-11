import { Bargain, Property } from "..";

describe("Account", () => {
  class Account {
    @Property()
    public id!: string;
    @Property({
      serializedKey: "created_date",
      serializer: (date: Date) => date.toISOString(),
      deserializer: (dateStr: string) => new Date(dateStr),
    })
    public createdDate!: Date;
  }

  const bargain = new Bargain([Account]);

  it("serialize", () => {
    const account = new Account();
    account.id = "asdf";
    account.createdDate = new Date();
    expect(account.createdDate).toBeInstanceOf(Date);
    const serialized = bargain.serialize(account);
    expect(serialized.id).toBe(account.id);
    expect(serialized.created_date).toBe(account.createdDate.toISOString());
  });

  it("deserialize", () => {
    const account = new Account();
    account.id = "asdf";
    account.createdDate = new Date();
    expect(account.createdDate).toBeInstanceOf(Date);

    const serialized = bargain.serialize(account);
    const deserialized = bargain.deserialize(serialized, Account);
    expect(deserialized.id).toBe(account.id);
    expect(deserialized.createdDate).toStrictEqual(account.createdDate);
  });
});
