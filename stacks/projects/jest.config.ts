/* eslint-disable */
export default {
    displayName: 'projects',
    preset: '../../jest.preset.js',
    globals: {
        'ts-jest': {
            tsconfig: '<rootDir>/tsconfig.spec.json',
        },
    },
    testEnvironment: 'node',
    coverageDirectory: '../../coverage/stacks/projects',
};
