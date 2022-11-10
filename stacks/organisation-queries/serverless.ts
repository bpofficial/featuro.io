import type { Serverless } from 'serverless/aws';
import { baseServerlessConfiguration } from '../../serverless.base';

const serverlessConfiguration = <Serverless>{
    ...baseServerlessConfiguration,
    service: 'organisation-queries',
    functions: {
        hello: {
            handler: 'src/handler.hello',
            events: [
                {
                    http: {
                        method: 'get',
                        path: 'hello',
                    },
                },
            ],
        },
    },
};

module.exports = serverlessConfiguration;
