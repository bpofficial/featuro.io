/* eslint-disable */
export default {
    displayName: 'environment-queries',
    preset: '../../jest.preset.js',
    globals: {
        'ts-jest': {
            tsconfig: '<rootDir>/tsconfig.spec.json',
        },
    },
    testEnvironment: 'node',
    coverageDirectory: '../../coverage/stacks/environment-queries',
};
