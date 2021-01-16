function InMemoryStorage() {
  this.cache = {};
}

InMemoryStorage.prototype.get = function get(key) {
  return this.cache[key];
};
InMemoryStorage.prototype.set = function set(key, value) {
  this.cache[key] = value;
};
InMemoryStorage.prototype.keys = function keys() {
  return Object.keys(this.cache);
};
InMemoryStorage.prototype.del = function del(key) {
  delete this.cache[key];
};
InMemoryStorage.prototype.clear = function clear() {
  this.cache = {};
};

module.exports = InMemoryStorage;
