// jest.config.js

module.exports = {
    testEnvironment: 'jsdom',
    setupFiles: ['./jest.setup.js'],
    modulePathIgnorePatterns: ['<rootDir>/node_modules/'],
    transform: {},
    testMatch: [
        "**/tests/**/*.test.js"
    ],
    verbose: true,
    collectCoverage: true,
    coverageDirectory: "coverage",
    coverageReporters: ["text", "lcov"],
    // Suppress deprecation warnings
    silent: true
};
