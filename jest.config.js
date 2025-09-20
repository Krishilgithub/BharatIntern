/** @type {import('jest').Config} */
module.exports = {
    testEnvironment: 'jsdom',
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
    },
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    transform: {
        '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
    },
    transformIgnorePatterns: [
        'node_modules/(?!(.*\\.mjs$|@supabase|@testing-library))',
    ],
    moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json'],
    testMatch: [
        '**/__tests__/**/*.(js|jsx|ts|tsx)',
        '**/*.(test|spec).(js|jsx|ts|tsx)',
    ],
};

