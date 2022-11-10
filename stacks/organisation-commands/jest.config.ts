/* eslint-disable */
export default {
    displayName: 'organisation-commands',
    preset: '../../jest.preset.js',
    globals: {
        'ts-jest': {
            tsconfig: '<rootDir>/tsconfig.spec.json',
        },
    },
    testEnvironment: 'node',
    coverageDirectory: '../../coverage/stacks/organisation-commands',
};
