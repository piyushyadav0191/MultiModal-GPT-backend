module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testPathIgnorePatterns: ["/node_modules/", "/dist/"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  collectCoverageFrom: ["src/**/*.{ts}", "./**/*.{ts}"],
  coverageDirectory: "coverage",
  coverageReporters: ["text-summary", "lcov"],
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
};
