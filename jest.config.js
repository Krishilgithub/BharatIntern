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
<<<<<<< HEAD
=======
    transformIgnorePatterns: [
        'node_modules/(?!(.*\\.mjs$|@supabase|@testing-library))',
    ],
    moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json'],
    testMatch: [
        '**/__tests__/**/*.(js|jsx|ts|tsx)',
        '**/*.(test|spec).(js|jsx|ts|tsx)',
    ],
>>>>>>> f6b022e8927e779bd7865a71bacf1552f748231d
};

