import { nodeSdk } from './node-sdk';

describe('nodeSdk', () => {
    it('should work', () => {
        expect(nodeSdk()).toEqual('node-sdk');
    });
});
