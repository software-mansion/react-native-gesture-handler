const detox = require('detox');
const config = require('../package.json').detox;
const adapter = require('detox/runners/mocha/adapter');

before(async () => {
  await detox.init(config);
});

beforeEach(async () => {
  await adapter.beforeEach(this);
});

afterEach(async () => {
  await adapter.afterEach(this);
});

after(async () => {
  await detox.cleanup();
});
