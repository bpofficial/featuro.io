import * as jwt from 'jsonwebtoken';
import JwksRsa  from 'jwks-rsa';

export class Authorizer {
    constructor(
        private issuer: string,
        private jwksUri: string,
        private audience: string) {
    }

    public async authorize(token: string): Promise<jwt.JwtPayload> {
        let decoded: any = jwt.decode(token, { complete: true });
        return this.getKey(decoded.header.kid)
            .then(x => {
                return this.verify(token, x);
            });
    }

    private getKey(kid:any): Promise<string> {
        const client = JwksRsa({ jwksUri: this.jwksUri });

        return new Promise((resolve, reject) => {
            client.getSigningKey(kid, (err, key) => {
                if (err) {
                    reject(err);
                }

                resolve(key.getPublicKey());
            });
        });
    }

    private verify(token: string, cert: string): Promise<{}> {
        const options = {
            audience: this.audience
        };

        return new Promise((resolve, reject) => {
            jwt.verify(token, cert, options, (err, decoded) => {
                if (err) {
                    reject(err);
                }

                resolve(decoded);
            });
        });
    }
}
