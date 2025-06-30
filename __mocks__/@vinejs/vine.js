// Create a basic chainable mock
const chain = () =>
  new Proxy(
    {},
    {
      get: () => chain,
    }
  );

module.exports = {
  validate: jest.fn().mockImplementation(async ({ schema, data }) => data),
  object: () => chain(),
  string: () => chain(),
  enum: () => chain(),
  number: () => chain(),
};
