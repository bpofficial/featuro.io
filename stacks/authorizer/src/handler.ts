
import { Authorizer } from './authorizer';
import { AWSPolicyGenerator } from './aws-policy-generator';
import { APIGatewayAuthorizerHandler } from 'aws-lambda';

const AUDIENCE = process.env.AUDIENCE;
const JWKS_URI = process.env.JWKS_URI;
const TOKEN_ISSUER = process.env.TOKEN_ISSUER;

export const authorize: APIGatewayAuthorizerHandler = (event, _context, cb) => {
    try {
        if (event.type === 'TOKEN') {
            const token = event.authorizationToken.substring(7);
            const client = new Authorizer(TOKEN_ISSUER, JWKS_URI, AUDIENCE);

            client.authorize(token)
                .then((result) => {
                    if (typeof result === 'string') {
                        return cb('Internal Server Error');
                    }
                    const policy = AWSPolicyGenerator.generate(result.sub, 'Allow', event.methodArn, result);
                    return cb(null, policy);
                })
                .catch(err => {
                    console.log(err);
                    cb('Unauthorized');
                });
        }
    } catch (err) {
        console.log(err);
    }
    cb('Unauthorized');
};
