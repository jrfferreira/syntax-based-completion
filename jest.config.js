module.exports = {
  collectCoverage: true,
  coverageDirectory: "coverage",
  verbose: true,
  transform: {
    "^.+\\.js$": "<rootDir>/tests/jest.transform.js",
    "\\.(css)$": "<rootDir>/node_modules/jest-transform-css"
  },
  testRegex: "(/__tests__/.*|\\.(test|spec))\\.jsx?$",
  moduleFileExtensions: ["js", "json", "jsx", "node"],
  coveragePathIgnorePatterns: ["\\.css", "index.js"],
  coverageThreshold: {
    global: {
      branches: 30,
      functions: 90,
      lines: 90,
      statements: 90
    }
  },
  setupFiles: ["./tests/setup"]
};
