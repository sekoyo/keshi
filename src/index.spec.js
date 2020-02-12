const expect = require('expect.js');
const createCache = require('./index');
const InMemoryStorage = require('./InMemoryStorage');

function timeout(fn, delay) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        fn();
        resolve();
      } catch (err) {
        reject(err);
      }
    }, delay);
  });
}

describe('keshi', () => {
  const cache = createCache();

  it('can create and return a simple non-expiring cache item', async () => {
    await cache.resolve('hello', 'world');
    const value = await cache.resolve('hello');
    expect(value).to.be('world');
  });

  it('resolves new value from cache after expiry time', async () => {
    const cacheFn = () => cache.resolve('asyncItem', () => Math.random(), '200 ms');
    const firstValue = await cacheFn();
    const cachedValueBefore = await cacheFn();

    expect(firstValue).to.eql(cachedValueBefore);

    return timeout(async () => {
      const cachedValueAfter = await cacheFn();
      expect(firstValue).to.not.eql(cachedValueAfter);
    }, 300);
  });

  it('can delete cached items', async () => {
    const value = await cache.resolve('hello', 'world');
    expect(value).to.be('world');
    cache.del('hello');
    const nextValue = await cache.resolve('hello');
    expect(nextValue).to.be(undefined);
  });

  it('can delete multiple cached items using wildcard *', async () => {
    const projectName = await cache.resolve('project.name', 'TheProject');
    const projectSettingsFile = await cache.resolve('project.file.settings', 'SettingsFile');
    expect(projectName).to.be('TheProject');
    expect(projectSettingsFile).to.be('SettingsFile');
    cache.del('project.', true);
    const nextProjectName = await cache.resolve('project.name');
    const nextProjectSettingsFile = await cache.resolve('project.file.settings');
    expect(nextProjectName).to.be(undefined);
    expect(nextProjectSettingsFile).to.be(undefined);
  });

  it('can clear the cache', async () => {
    await cache.resolve('hello', 'world');
    await cache.resolve('goodbye', 'mars');
    const value = await cache.resolve('hello');
    const value2 = await cache.resolve('goodbye');
    expect(value).to.be('world');
    expect(value2).to.be('mars');
    cache.clear();
    const newValue = await cache.resolve('hello');
    const newValue2 = await cache.resolve('goodbye');
    expect(newValue).to.be(undefined);
    expect(newValue2).to.be(undefined);
  });

  it('can use custom storage', async () => {
    const customStorage = new InMemoryStorage();
    const customCache = createCache({ customStorage });

    let value;

    await customCache.resolve('hello', 'world');
    value = await customCache.resolve('hello');
    expect(value).to.be('world');

    value = await cache.resolve('hello', 'world');
    expect(value).to.be('world');
    cache.del('hello');
    const nextValue = await cache.resolve('hello');
    expect(nextValue).to.be(undefined);

    customCache.teardown();
  });

  after(() => cache.teardown());
});
