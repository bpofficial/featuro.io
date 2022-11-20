/* eslint-disable */
export default {
    displayName: 'billing',
    preset: '../../jest.preset.js',
    globals: {
        'ts-jest': {
            tsconfig: '<rootDir>/tsconfig.spec.json',
        },
    },
    testEnvironment: 'node',
    coverageDirectory: '../../coverage/stacks/billing',
};
