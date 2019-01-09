module.exports = {
  "extends": "airbnb-base",
  "globals": {
    "describe": true,
    "it": true,
    "before": true,
    "beforeEach": true,
    "after": true,
    "afterEach": true,
  },
  "rules": {
    "eol-last": 0,
    "max-len": ["error", { "code": 120 }],
    "no-plusplus": 0,
  }
};